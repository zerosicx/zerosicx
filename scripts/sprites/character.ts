import { importSheet, tidy, type RGBA } from './importSheet.ts';

/**
 * Turns an imported character sheet into game frames.
 *
 * Source sprites drift around and their hair sways, so every standing pose is
 * re-anchored on the centre of her feet and dropped onto a shared baseline;
 * lying poses are centred instead. Frames are as wide as the furthest-reaching
 * pose, so nothing is ever clipped.
 */
const OUTLINE: [number, number, number] = [42, 27, 45]; // palette ink
const PAD = 2; // room for the outline
export const FRAME_H = 42;
const BASELINE = FRAME_H - 3; // feet row, leaving room for the outline

/** A sprite index on the sheet (reading order), optionally nudged up/down for a bob. */
export type FrameSpec = number | [index: number, dy: number];

const blank = (w: number, h: number): RGBA => ({ w, h, data: new Uint8ClampedArray(w * h * 4) });

function pad(img: RGBA): RGBA {
  const out = blank(img.w + PAD * 2, img.h + PAD * 2);
  for (let y = 0; y < img.h; y++) out.data.set(img.data.subarray(y * img.w * 4, (y + 1) * img.w * 4), ((y + PAD) * out.w + PAD) * 4);
  return out;
}

/** Where her feet are, and how far the sprite reaches either side of them. */
function extent(img: RGBA) {
  let x0 = img.w, x1 = -1, y1 = -1;
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < img.w; x++)
      if (img.data[(y * img.w + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  let sum = 0, n = 0;
  for (let y = y1 - 5; y <= y1; y++)
    for (let x = 0; x < img.w; x++)
      if (img.data[(y * img.w + x) * 4 + 3]) { sum += x; n++; }
  return { feetX: n ? sum / n : img.w / 2, x0, x1, y1 };
}

function placeAt(img: RGBA, frameW: number, cx: number, bottom: number): RGBA {
  const dx = Math.round(frameW / 2 - 0.5 - cx), dy = BASELINE - bottom;
  const out = blank(frameW, FRAME_H);
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < img.w; x++) {
      const i = (y * img.w + x) * 4;
      if (!img.data[i + 3]) continue;
      const tx = x + dx, ty = y + dy;
      if (tx < 0 || ty < 0 || tx >= frameW || ty >= FRAME_H) throw new Error('character frame would clip');
      out.data.set(img.data.subarray(i, i + 4), (ty * frameW + tx) * 4);
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
  opts: { rows: number; lying: number[]; frames: Record<string, FrameSpec>; factor?: number; colours?: number },
) {
  const sprites = importSheet(file, { rows: opts.rows, factor: opts.factor ?? 5.8, colours: opts.colours ?? 24 })
    .map(s => tidy(pad(s), OUTLINE));
  const lying = new Set(opts.lying);
  const extents = sprites.map(extent);
  // Frame width: twice the furthest any pose reaches from its anchor.
  const reach = Math.max(...extents.map((e, i) =>
    lying.has(i) ? (e.x1 - e.x0 + 1) / 2 : Math.max(e.feetX - e.x0, e.x1 - e.feetX) + 1));
  const frameW = Math.ceil(reach) * 2 + 1;
  const placed = sprites.map((s, i) => {
    const e = extents[i];
    return placeAt(s, frameW, lying.has(i) ? (e.x0 + e.x1) / 2 : e.feetX, e.y1);
  });
  return Object.entries(opts.frames).map(([name, spec]) => {
    const [i, dy] = typeof spec === 'number' ? [spec, 0] : spec;
    if (!placed[i]) throw new Error(`${file}: no sprite #${i} for ${name}`);
    return { name, img: dy ? shift(placed[i], dy) : placed[i] };
  });
}
