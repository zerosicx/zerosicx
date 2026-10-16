import { Canvas, type Frame } from './lib.ts';
import type { Colour } from './palette.ts';

const KEY: Record<string, Colour> = {
  k: 'ink',
  '0': 'stone0', '1': 'stone1', '2': 'stone2', '3': 'stone3', '4': 'stone4',
  o: 'glow0', g: 'glow1', G: 'glow2',
  m: 'grass1', M: 'grass2', // moss
};

// Kasuga-style stone lantern, 16×32. Light comes from the top-left.
const LANTERN = [
  '.......kk.......',
  '......k43k......',
  '......k32k......',
  '.....kk21kk.....',
  '....k443321k....',
  '...k44333221k...',
  'k.k4433332211k.k',
  'k4433333222211mk',
  'k433332222111mMk',
  '.kkkkkkkkkkkkkk.',
  '..k3333322221k..',
  '...k3kkkkkk1k...',
  '...k3k@@@@k1k...',
  '...k3k@@@@k1k...',
  '...k3k@@@@k1k...',
  '...k3kkkkkk1k...',
  '..k3333322221k..',
  '.k433333222211k.',
  '.k322222111110k.',
  '..kkkkkkkkkkkk..',
  '.....k3321k.....',
  '.....k3321k.....',
  '.....k3m21k.....',
  '.....k3321k.....',
  '.....k33m1k.....',
  '.....k3321k.....',
  '....kk3321kk....',
  '...k43333221k...',
  '..k4333332211k..',
  '..k3222221110k..',
  '..kmM1111100mk..',
  '...kkkkkkkkkk...',
];

// Two flicker states for the 4×3 window.
const FLAMES = [
  ['gGGg', 'gGGo', 'oggo'],
  ['ggGg', 'gGgo', 'ogoo'],
];

export function buildLantern(): Frame[] {
  return FLAMES.map((flame, i) => {
    const c = new Canvas(16, 32).grid(LANTERN, KEY);
    c.grid(flame, KEY, 6, 12);
    return { name: `lantern_${i}`, canvas: c };
  });
}

// Petals, 5×5, as tumbling orientations — cycled as an animation they flutter.
const PETAL_KEY: Record<string, Colour> = { '1': 'pink1', '2': 'pink2', '3': 'pink3', '4': 'pink4', '5': 'pink5' };
const PETALS = [
  ['.....', '.45..', '4432.', '.322.', '.....'],
  ['.....', '..4..', '.432.', '.322.', '..2..'],
  ['.....', '.....', '4332.', '.....', '.....'],
  ['.....', '..54.', '.3442', '.221.', '.....'],
];

export function buildPetals(): Frame[] {
  return PETALS.map((rows, i) => ({ name: `petal_${i}`, canvas: new Canvas(5, 5).grid(rows, PETAL_KEY) }));
}

/** Stepped radial glow, drawn additively over lanterns. */
export function buildGlow() {
  const c = new Canvas(32, 32);
  c.each((x, y) => {
    const d = Math.hypot(x - 15.5, y - 15.5);
    if (d < 5) c.set(x, y, 'glow2');
    else if (d < 10) c.set(x, y, 'glow1');
    else if (d < 15 && (x + y) % 2 === 0) c.set(x, y, 'glow0'); // dithered falloff
  });
  return c;
}

/** Dithered contact shadow for small props on grass. */
export function buildShadow() {
  const c = new Canvas(16, 6);
  c.each((x, y) => {
    const d = Math.hypot((x - 7.5) / 7.5, (y - 2.5) / 2.5);
    if (d < 1 && (d < 0.7 || (x + y) % 2 === 0)) c.set(x, y, 'grass1');
  });
  return c;
}
