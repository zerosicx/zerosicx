import fs from 'node:fs';
import path from 'node:path';
import pngjs from 'pngjs';

const { PNG } = pngjs;

/**
 * Imports a hand-made (or upscaled) character sheet into crisp pixel-art frames.
 *
 * Such sheets rarely sit on a clean grid: sprites drift across the nominal
 * cell lines, there's no consistent pixel size, and the "transparency" is a
 * checkerboard baked into the image. So instead of slicing cells we:
 *   1. flood-fill the light, grey checkerboard in from the sheet's border (the
 *      dark outline stops the fill, so whites inside a sprite survive);
 *   2. find each sprite as a connected blob, and order blobs by row, then x;
 *   3. quantise to a shared palette (k-means over every sprite);
 *   4. downsample by a fixed factor with a majority vote per block, giving
 *      dark outline colours extra weight so line work isn't lost.
 */

export type RGBA = { w: number; h: number; data: Uint8ClampedArray };

const blank = (w: number, h: number): RGBA => ({ w, h, data: new Uint8ClampedArray(w * h * 4) });

export function readPng(file: string) {
  const png = PNG.sync.read(fs.readFileSync(file));
  return { w: png.width, h: png.height, data: new Uint8ClampedArray(png.data) } as RGBA;
}

export function writePng(file: string, img: RGBA) {
  const png = new PNG({ width: img.w, height: img.h });
  png.data.set(img.data);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, PNG.sync.write(png));
}

const isBackdrop = (r: number, g: number, b: number) =>
  Math.max(r, g, b) - Math.min(r, g, b) < 22 && Math.min(r, g, b) > 196;

type Blob = { id: number; size: number; x0: number; x1: number; y0: number; y1: number };

/** Label every sprite blob on the sheet; returns labels plus blob boxes. */
function findBlobs(src: RGBA) {
  const { w, h } = src;
  const bg = new Uint8Array(w * h);
  const stack: number[] = [];
  const fill = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (bg[p] || !isBackdrop(src.data[p * 4], src.data[p * 4 + 1], src.data[p * 4 + 2])) return;
    bg[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) { fill(x, 0); fill(x, h - 1); }
  for (let y = 0; y < h; y++) { fill(0, y); fill(w - 1, y); }
  while (stack.length) {
    const p = stack.pop()!, x = p % w, y = (p / w) | 0;
    fill(x + 1, y); fill(x - 1, y); fill(x, y + 1); fill(x, y - 1);
  }

  const label = new Int32Array(w * h);
  const blobs: Blob[] = [];
  for (let start = 0; start < w * h; start++) {
    if (bg[start] || label[start]) continue;
    const blob: Blob = { id: blobs.length + 1, size: 0, x0: w, x1: 0, y0: h, y1: 0 };
    const queue = [start];
    label[start] = blob.id;
    while (queue.length) {
      const p = queue.pop()!, x = p % w, y = (p / w) | 0;
      blob.size++;
      blob.x0 = Math.min(blob.x0, x); blob.x1 = Math.max(blob.x1, x);
      blob.y0 = Math.min(blob.y0, y); blob.y1 = Math.max(blob.y1, y);
      for (const q of [p - 1, p + 1, p - w, p + w]) {
        if (q < 0 || q >= w * h || bg[q] || label[q]) continue;
        if ((q === p - 1 && x === 0) || (q === p + 1 && x === w - 1)) continue;
        label[q] = blob.id;
        queue.push(q);
      }
    }
    blobs.push(blob);
  }
  return { label, blobs };
}

/**
 * k-means palette over sampled sprite pixels. `pinned` colours are always in
 * the palette and never move — for small accents (a hair clip) that are too
 * rare to win a cluster of their own.
 */
function buildPalette(samples: number[][], k: number, pinned: number[][] = [], iterations = 12) {
  const sorted = [...samples].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let centres = Array.from({ length: k }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]]);
  for (let it = 0; it < iterations; it++) {
    const all = [...centres, ...pinned];
    const sums = centres.map(() => [0, 0, 0, 0]);
    for (const s of samples) {
      const c = nearest(all, s);
      if (c >= centres.length) continue; // claimed by a pinned colour
      sums[c][0] += s[0]; sums[c][1] += s[1]; sums[c][2] += s[2]; sums[c][3]++;
    }
    centres = centres.map((c, i) => (sums[i][3] ? [sums[i][0] / sums[i][3], sums[i][1] / sums[i][3], sums[i][2] / sums[i][3]] : c));
  }
  return [...centres.map(c => c.map(Math.round)), ...pinned];
}

function nearest(palette: number[][], c: number[]) {
  let best = 0, bestD = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    // weight green more, like the eye does
    const d = 2 * (p[0] - c[0]) ** 2 + 4 * (p[1] - c[1]) ** 2 + 3 * (p[2] - c[2]) ** 2;
    if (d < bestD) { bestD = d; best = i; }
  }
  return best;
}

export type ImportOptions = {
  /** Rows of sprites on the sheet, used to order blobs. */
  rows: number;
  /** Source pixels per output pixel. */
  factor: number;
  colours?: number;
  /** Ignore blobs smaller than this many source pixels (specks, text). */
  minSize?: number;
  /** Colours that must survive quantisation, as [r, g, b]. */
  pin?: number[][];
};

/** Every sprite on the sheet, downsampled, in reading order (row by row, left to right). */
export function importSheet(file: string, opts: ImportOptions): RGBA[] {
  const src = readPng(file);
  const { label, blobs } = findBlobs(src);
  const minSize = opts.minSize ?? 2000;
  const rowH = src.h / opts.rows;
  const sprites = blobs
    .filter(b => b.size >= minSize)
    .map(b => ({ ...b, row: Math.floor((b.y0 + b.y1) / 2 / rowH) }))
    .sort((a, b) => a.row - b.row || a.x0 - b.x0);

  // shared palette from a sample of every sprite
  const samples: number[][] = [];
  for (const s of sprites)
    for (let y = s.y0; y <= s.y1; y += 3)
      for (let x = s.x0 + ((y / 3) % 3); x <= s.x1; x += 3) {
        const p = y * src.w + x;
        if (label[p] === s.id) samples.push([src.data[p * 4], src.data[p * 4 + 1], src.data[p * 4 + 2]]);
      }
  const palette = buildPalette(samples, opts.colours ?? 32, opts.pin);
  const lum = palette.map(p => 0.3 * p[0] + 0.59 * p[1] + 0.11 * p[2]);

  return sprites.map(s => {
    const ow = Math.ceil((s.x1 - s.x0 + 1) / opts.factor);
    const oh = Math.ceil((s.y1 - s.y0 + 1) / opts.factor);
    const out = blank(ow, oh);
    const votes = new Float64Array(palette.length + 1); // last slot = transparent
    for (let oy = 0; oy < oh; oy++)
      for (let ox = 0; ox < ow; ox++) {
        votes.fill(0);
        const x0 = s.x0 + Math.floor(ox * opts.factor), x1 = s.x0 + Math.floor((ox + 1) * opts.factor);
        const y0 = s.y0 + Math.floor(oy * opts.factor), y1 = s.y0 + Math.floor((oy + 1) * opts.factor);
        for (let y = y0; y < y1; y++)
          for (let x = x0; x < x1; x++) {
            const p = y * src.w + x;
            if (x > s.x1 || y > s.y1 || label[p] !== s.id) { votes[palette.length] += 1; continue; }
            const c = nearest(palette, [src.data[p * 4], src.data[p * 4 + 1], src.data[p * 4 + 2]]);
            votes[c] += lum[c] < 70 ? 1.9 : 1; // keep outlines
          }
        let best = palette.length, bestV = -1;
        votes.forEach((v, i) => { if (v > bestV) { bestV = v; best = i; } });
        if (best === palette.length) continue;
        const o = (oy * ow + ox) * 4;
        out.data[o] = palette[best][0];
        out.data[o + 1] = palette[best][1];
        out.data[o + 2] = palette[best][2];
        out.data[o + 3] = 255;
      }
    return out;
  });
}

/**
 * Tidy a downsampled frame: drop pale checkerboard halo on the silhouette,
 * merge isolated speckles into their surroundings, and draw a 1px outline in
 * the darkest palette colour so it matches the hand-made sprites.
 *
 * `keepDarkEdges`: where the art already ends in a dark line, use that as the
 * outline instead of adding another one outside it (which would double it).
 */
export function tidy(img: RGBA, outline: [number, number, number], keepDarkEdges = false) {
  const { w, h } = img;
  const get = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h ? -1 : (y * w + x) * 4);
  const opaque = (x: number, y: number) => { const i = get(x, y); return i >= 0 && img.data[i + 3] > 0; };
  const key = (i: number) => (img.data[i] << 16) | (img.data[i + 1] << 8) | img.data[i + 2];

  // 1. halo: pale, greyish pixels touching transparency
  for (let pass = 0; pass < 2; pass++)
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const i = get(x, y);
        if (!img.data[i + 3]) continue;
        const [r, g, b] = [img.data[i], img.data[i + 1], img.data[i + 2]];
        const edge = !opaque(x + 1, y) || !opaque(x - 1, y) || !opaque(x, y + 1) || !opaque(x, y - 1);
        if (edge && Math.min(r, g, b) > 185 && Math.max(r, g, b) - Math.min(r, g, b) < 40) img.data[i + 3] = 0;
      }

  // 2. despeckle: a pixel unlike all four neighbours, which agree, takes their colour
  const copy = new Uint8ClampedArray(img.data);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const i = get(x, y);
      if (!copy[i + 3]) continue;
      const ns = [get(x + 1, y), get(x - 1, y), get(x, y + 1), get(x, y - 1)];
      if (ns.some(n => !copy[n + 3])) continue;
      const k0 = (copy[ns[0]] << 16) | (copy[ns[0] + 1] << 8) | copy[ns[0] + 2];
      const same = ns.every(n => ((copy[n] << 16) | (copy[n + 1] << 8) | copy[n + 2]) === k0);
      if (same && k0 !== key(i)) img.data.set(copy.subarray(ns[0], ns[0] + 3), i);
    }

  // 3. outline around the silhouette
  const before = new Uint8ClampedArray(img.data);
  const was = (x: number, y: number) => { const i = get(x, y); return i >= 0 && before[i + 3] > 0; };
  const light = (x: number, y: number) => {
    const i = get(x, y);
    return i >= 0 && before[i + 3] > 0 && 0.3 * before[i] + 0.59 * before[i + 1] + 0.11 * before[i + 2] >= 70;
  };
  const edge = keepDarkEdges ? light : was;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (was(x, y)) continue;
      if (edge(x + 1, y) || edge(x - 1, y) || edge(x, y + 1) || edge(x, y - 1)) {
        const i = get(x, y);
        img.data[i] = outline[0]; img.data[i + 1] = outline[1]; img.data[i + 2] = outline[2]; img.data[i + 3] = 255;
      }
    }
  return img;
}

/** Pack equal-size frames into a sheet; returns the image and tilemaps.ts-style metadata. */
export function packRaw(frames: { name: string; img: RGBA }[], columns: number) {
  const fw = frames[0].img.w, fh = frames[0].img.h;
  const rows = Math.ceil(frames.length / columns);
  const sheet = blank(fw * columns, fh * rows);
  const tiles: Record<string, { col: number; row: number; x: number; y: number; w: number; h: number }> = {};
  frames.forEach(({ name, img }, i) => {
    const col = i % columns, row = Math.floor(i / columns);
    for (let y = 0; y < fh; y++)
      sheet.data.set(img.data.subarray(y * fw * 4, (y + 1) * fw * 4), ((row * fh + y) * sheet.w + col * fw) * 4);
    tiles[name] = { col, row, x: col * fw, y: row * fh, w: fw, h: fh };
  });
  return { sheet, meta: { columns, tileSize: { w: fw, h: fh }, tiles } };
}
