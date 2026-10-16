import { importSheet, tidy, type RGBA } from './importSheet.ts';

/**
 * Turns an imported character sheet into game frames.
 *
 * Source sprites drift around inside their cells, so every standing pose is
 * re-anchored: horizontally on the centre of her head (the face is what the
 * eye tracks, and it doesn't move when a foot lifts or hair sways) — or of the
 * paws, for an animal whose head sits at one end — and vertically onto a
 * shared floor line. Lying poses are centred; waist-up poses (seated)
 * line their head up with a reference standing frame. Frames are as wide as
 * the furthest-reaching pose, so nothing is ever clipped.
 */
const OUTLINE: [number, number, number] = [42, 27, 45]; // palette ink
const PAD = 2; // room for the outline
const FLOOR_MARGIN = 3; // rows below the feet, leaving room for the outline

/**
 * A sprite index on the sheet (reading order), optionally nudged up/down for a
 * bob, or turned a quarter clockwise ('cw') — e.g. a lying pose with her head
 * on the left becomes one lying head-up, to fit a bed seen from above.
 */
export type FrameSpec = number | [index: number, dy: number] | [index: number, dy: number, turn: 'cw'];

const blank = (w: number, h: number): RGBA => ({ w, h, data: new Uint8ClampedArray(w * h * 4) });

function pad(img: RGBA): RGBA {
  const out = blank(img.w + PAD * 2, img.h + PAD * 2);
  for (let y = 0; y < img.h; y++) out.data.set(img.data.subarray(y * img.w * 4, (y + 1) * img.w * 4), ((y + PAD) * out.w + PAD) * 4);
  return out;
}

/** Bounding box, plus the horizontal centre of the head (top quarter) and of the paws (bottom rows). */
function extent(img: RGBA) {
  let x0 = img.w, x1 = -1, y0 = img.h, y1 = -1;
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < img.w; x++)
      if (img.data[(y * img.w + x) * 4 + 3]) {
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
  const centreOf = (from: number, to: number) => {
    let sum = 0, n = 0;
    for (let y = Math.round(from); y <= to; y++)
      for (let x = 0; x < img.w; x++)
        if (img.data[(y * img.w + x) * 4 + 3]) { sum += x; n++; }
    return n ? sum / n : img.w / 2;
  };
  return { headX: centreOf(y0, y0 + (y1 - y0) / 4), feetX: centreOf(y1 - 4, y1), x0, x1, y0, y1 };
}

function placeAt(img: RGBA, frameW: number, frameH: number, cx: number, dy: number, label: string): RGBA {
  const dx = Math.round(frameW / 2 - 0.5 - cx);
  const out = blank(frameW, frameH);
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < img.w; x++) {
      const i = (y * img.w + x) * 4;
      if (!img.data[i + 3]) continue;
      const tx = x + dx, ty = y + dy;
      if (tx < 0 || ty < 0 || tx >= frameW || ty >= frameH) throw new Error(`${label} would clip: make the frame bigger or the import factor larger`);
      out.data.set(img.data.subarray(i, i + 4), (ty * frameW + tx) * 4);
    }
  return out;
}

/** Turn a frame's content a quarter clockwise and centre it in the same-size frame. */
function turnCW(img: RGBA): RGBA {
  let x0 = img.w, x1 = -1, y0 = img.h, y1 = -1;
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < img.w; x++)
      if (img.data[(y * img.w + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1; // content size before turning
  const ox = Math.floor((img.w - ch) / 2), oy = Math.floor((img.h - cw) / 2);
  if (ox < 0 || oy < 0) throw new Error('turned frame would clip');
  const out = blank(img.w, img.h);
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const i = (y * img.w + x) * 4;
      if (!img.data[i + 3]) continue;
      // clockwise: (x, y) → (ch - 1 - y, x) in content space
      const tx = ox + (ch - 1 - (y - y0)), ty = oy + (x - x0);
      out.data.set(img.data.subarray(i, i + 4), (ty * img.w + tx) * 4);
    }
  return out;
}

/** Shift a frame vertically (negative = up) for bobbing. */
function shift(img: RGBA, dy: number): RGBA {
  const out = blank(img.w, img.h);
  for (let y = 0; y < img.h; y++) {
    const sy = y - dy;
    if (sy >= 0 && sy < img.h) out.data.set(img.data.subarray(sy * img.w * 4, (sy + 1) * img.w * 4), y * img.w * 4);
  }
  return out;
}

export function importCharacter(
  file: string,
  opts: {
    rows: number;
    lying: number[];
    /** Waist-up poses, and the standing frame whose head height they match. */
    waistUp?: { frames: number[]; matchHeadOf: number };
    frames: Record<string, FrameSpec>;
    factor?: number;
    colours?: number;
    /** Accent colours that must survive quantisation, as [r, g, b]. */
    pin?: number[][];
    /** The art already has a dark outline: keep it rather than adding a second. */
    keepDarkEdges?: boolean;
    /** Frame height in px (default 42, the characters' height). */
    frameH?: number;
    /** Centre poses on the head (default) or on the paws (animals). */
    anchor?: 'head' | 'feet';
  },
) {
  const frameH = opts.frameH ?? 42;
  const baseline = frameH - FLOOR_MARGIN;
  const sprites = importSheet(file, { rows: opts.rows, factor: opts.factor ?? 5.8, colours: opts.colours ?? 24, pin: opts.pin })
    .map(s => tidy(pad(s), OUTLINE, opts.keepDarkEdges));
  const lying = new Set(opts.lying);
  const waistUp = new Set(opts.waistUp?.frames ?? []);
  const extents = sprites.map(extent);
  const centre = (i: number) =>
    lying.has(i) ? (extents[i].x0 + extents[i].x1) / 2 : opts.anchor === 'feet' ? extents[i].feetX : extents[i].headX;
  // Frame width: twice the furthest any pose reaches from its anchor.
  const reach = Math.max(...extents.map((e, i) => Math.max(centre(i) - e.x0, e.x1 - centre(i)) + 1));
  const frameW = Math.ceil(reach) * 2 + 1;
  const ref = opts.waistUp ? extents[opts.waistUp.matchHeadOf] : null;
  const placed = sprites.map((s, i) => {
    const e = extents[i];
    // Standing and lying poses sit on the floor line; waist-up poses put the
    // top of her head where the reference standing pose has it.
    const dy = waistUp.has(i) && ref ? baseline - ref.y1 + ref.y0 - e.y0 : baseline - e.y1;
    return placeAt(s, frameW, frameH, centre(i), dy, `${file} sprite #${i}`);
  });
  return Object.entries(opts.frames).map(([name, spec]) => {
    const [i, dy, turn] = typeof spec === 'number' ? [spec, 0, undefined] : spec;
    if (!placed[i]) throw new Error(`${file}: no sprite #${i} for ${name}`);
    const img = turn === 'cw' ? turnCW(placed[i]) : placed[i];
    return { name, img: dy ? shift(img, dy) : img };
  });
}
