import { Canvas, hash, noise, ramp, rng } from './lib.ts';
import type { Colour } from './palette.ts';

const BLOSSOM: Colour[] = ['pink0', 'pink1', 'pink2', 'pink3', 'pink4'];
const BARK: Colour[] = ['bark0', 'bark1', 'bark2', 'bark3'];
const LIGHT = { x: -0.6, y: -0.8 }; // direction towards the light: top-left

type Blob = { x: number; y: number; r: number };

/** Thick line for trunk/branches, width interpolated from w0 to w1. */
function limb(c: Canvas, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number) {
  const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const cx = x0 + (x1 - x0) * t;
    const cy = y0 + (y1 - y0) * t;
    const w = w0 + (w1 - w0) * t;
    for (let dx = -w / 2; dx <= w / 2; dx += 0.5) {
      const x = Math.round(cx + dx);
      const y = Math.round(cy);
      // Shade across the limb: lit on the left, dark on the right.
      const side = (dx + w / 2) / Math.max(w, 1);
      const bark = hash(x, y, 3) > 0.85 ? 0.15 : 0; // bark texture flecks
      c.set(x, y, ramp(BARK, 0.95 - side * 0.85 - bark, x, y, 0.2));
    }
  }
}

/**
 * Sakura tree, ~64×80. The canopy is a union of small "clumps", each shaded
 * as its own sphere — that bumpy, clustered look is what reads as blossom
 * rather than a pink cloud.
 */
export function buildTree(seed = 7) {
  const W = 64, H = 80;
  const c = new Canvas(W, H);
  const r = rng(seed);

  // Ground shadow (on grass), drawn first so everything sits on it.
  for (let y = 70; y < 78; y++)
    for (let x = 12; x < 52; x++) {
      const d = Math.hypot((x - 32) / 20, (y - 74) / 4);
      if (d < 1 && (d < 0.75 || (x + y) % 2 === 0)) c.set(x, y, 'grass1');
    }

  // Trunk + branches
  limb(c, 32, 76, 31, 52, 7, 4);
  limb(c, 29, 76, 26, 72, 3, 1); // root flare
  limb(c, 35, 76, 38, 73, 3, 1);
  limb(c, 31, 54, 18, 38, 3, 1.5);
  limb(c, 31, 52, 46, 36, 3, 1.5);
  limb(c, 31, 50, 30, 30, 3, 1.5);

  // Canopy: overlapping clumps painted back-to-front (top first), each shaded
  // as its own little sphere so the edges between clumps stay readable.
  const masses: Blob[] = [
    { x: 32, y: 24, r: 17 }, { x: 15, y: 33, r: 11 }, { x: 49, y: 32, r: 11 },
    { x: 32, y: 38, r: 10 },
  ];
  const clumps: Blob[] = [];
  while (clumps.length < 26) {
    const m = masses[Math.floor(r() * masses.length)];
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * m.r * 0.8;
    clumps.push({ x: m.x + Math.cos(a) * d, y: m.y + Math.sin(a) * d, r: 5.5 + r() * 3 });
  }
  clumps.sort((p, q) => p.y - q.y);

  const canopy = new Canvas(W, H);
  for (const b of clumps) {
    for (let y = Math.floor(b.y - b.r - 2); y <= b.y + b.r + 2; y++)
      for (let x = Math.floor(b.x - b.r - 2); x <= b.x + b.r + 2; x++) {
        const dx = x + 0.5 - b.x, dy = y + 0.5 - b.y;
        const rr = b.r + (noise(x / 2, y / 2, seed) - 0.5) * 2.5; // frilly blossom edge
        const d = Math.hypot(dx, dy) / rr;
        if (d >= 1) continue;
        const lambert = (dx / rr) * LIGHT.x + (dy / rr) * LIGHT.y; // -1..1
        const height = 1 - (b.y - 6) / 40; // upper clumps catch more sky light
        let v = 0.42 + lambert * 0.32 + height * 0.2;
        if (d > 0.8 && lambert < 0) v -= 0.2; // shaded rim separates clumps
        canopy.set(x, y, ramp(BLOSSOM, v, x, y, 0.15));
      }
  }

  // Sparkle highlights on the brightest pixels
  canopy.each((x, y, col) => {
    if (col === 'pink4' && hash(x, y, seed) > 0.75) canopy.set(x, y, 'pink5');
  });

  // Selective outline: darker on the shadow side, softer on the lit side.
  canopy.outline((_c, x, y) => (x < 26 && y < 30 ? 'pink1' : 'pink0'));
  c.blit(canopy);
  c.outline(col => (col.startsWith('bark') ? 'ink' : null));
  return c;
}
