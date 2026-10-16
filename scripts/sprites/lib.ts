import fs from 'node:fs';
import path from 'node:path';
import pngjs from 'pngjs';
import { PALETTE, type Colour } from './palette.ts';

const { PNG } = pngjs;

/** A palette-locked pixel canvas. `null` = transparent. */
export class Canvas {
  readonly w: number;
  readonly h: number;
  readonly px: (Colour | null)[];

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.px = new Array(w * h).fill(null);
  }

  in(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  get(x: number, y: number): Colour | null {
    return this.in(x, y) ? this.px[y * this.w + x] : null;
  }

  set(x: number, y: number, c: Colour | null) {
    x = Math.round(x);
    y = Math.round(y);
    if (this.in(x, y)) this.px[y * this.w + x] = c;
  }

  fill(c: Colour) {
    this.px.fill(c);
    return this;
  }

  each(fn: (x: number, y: number, c: Colour | null) => void) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) fn(x, y, this.get(x, y));
  }

  /**
   * Stamp a character grid. `key` maps characters to colours;
   * characters missing from the key (e.g. '.') are skipped.
   */
  grid(rows: string[], key: Record<string, Colour>, ox = 0, oy = 0) {
    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (key[ch]) this.set(ox + x, oy + y, key[ch]);
      });
    });
    return this;
  }

  /** Copy another canvas on top of this one (transparent pixels skipped). */
  blit(src: Canvas, ox = 0, oy = 0) {
    src.each((x, y, c) => {
      if (c) this.set(ox + x, oy + y, c);
    });
    return this;
  }

  clone() {
    return new Canvas(this.w, this.h).blit(this);
  }

  /**
   * Draw a 1px outline outside the opaque shape. `pick` chooses the outline
   * colour from the neighbouring opaque pixel (for selective outlining).
   */
  outline(pick: (inner: Colour, x: number, y: number) => Colour | null) {
    const src = this.clone();
    src.each((x, y, c) => {
      if (c) return;
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const n = src.get(x + dx, y + dy);
        if (n) {
          const o = pick(n, x, y);
          if (o) this.set(x, y, o);
          return;
        }
      }
    });
    return this;
  }

  save(file: string) {
    const png = new PNG({ width: this.w, height: this.h });
    this.each((x, y, c) => {
      const i = (y * this.w + x) * 4;
      if (!c) return;
      const hex = PALETTE[c];
      png.data[i] = parseInt(hex.slice(1, 3), 16);
      png.data[i + 1] = parseInt(hex.slice(3, 5), 16);
      png.data[i + 2] = parseInt(hex.slice(5, 7), 16);
      png.data[i + 3] = 255;
    });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, PNG.sync.write(png));
  }
}

// ─── Noise & dithering ──────────────────────────────────────────────────────

/** Deterministic hash → [0, 1). */
export function hash(x: number, y: number, seed = 0) {
  let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Small seeded PRNG for scattering things. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/** Smooth value noise. Pass `period` to make it tile seamlessly. */
export function noise(x: number, y: number, seed = 0, period = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const wrap = (v: number) => (period ? ((v % period) + period) % period : v);
  const f = (a: number, b: number) => hash(wrap(a), wrap(b), seed);
  const tx = x - xi;
  const ty = y - yi;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const top = f(xi, yi) * (1 - sx) + f(xi + 1, yi) * sx;
  const bot = f(xi, yi + 1) * (1 - sx) + f(xi + 1, yi + 1) * sx;
  return top * (1 - sy) + bot * sy;
}

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map(r => r.map(v => (v + 0.5) / 16));

/**
 * Map a continuous value (0..1) onto a colour ramp with ordered dithering
 * between neighbouring steps. `spread` limits dithering to a narrow band
 * around each step boundary, so most of the area stays flat.
 */
export function ramp(ramp: Colour[], v: number, x: number, y: number, spread = 0.35) {
  const t = Math.max(0, Math.min(0.9999, v)) * ramp.length;
  const i = Math.floor(t);
  const frac = t - i;
  const threshold = BAYER4[((y % 4) + 4) % 4][((x % 4) + 4) % 4];
  // Only dither in the band near the upper boundary of this step.
  const local = (frac - (1 - spread)) / spread;
  if (local > 0 && i + 1 < ramp.length && local > threshold) return ramp[i + 1];
  return ramp[i];
}

// ─── Sheets ─────────────────────────────────────────────────────────────────

export type Frame = { name: string; canvas: Canvas };
export type TileEntry = { col: number; row: number; x: number; y: number; w: number; h: number };

/** Pack equal-size frames into a grid sheet; returns tilemaps.ts-style metadata. */
export function packSheet(frames: Frame[], columns: number) {
  const fw = frames[0].canvas.w;
  const fh = frames[0].canvas.h;
  const rows = Math.ceil(frames.length / columns);
  const sheet = new Canvas(fw * columns, fh * rows);
  const tiles: Record<string, TileEntry> = {};
  frames.forEach((f, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    sheet.blit(f.canvas, col * fw, row * fh);
    tiles[f.name] = { col, row, x: col * fw, y: row * fh, w: fw, h: fh };
  });
  return { sheet, meta: { columns, tileSize: { w: fw, h: fh }, tiles } };
}
