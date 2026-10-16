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

/**
 * Garden mailbox on a wooden post, 16×24: a rounded rose-red box with a cream
 * letter slot and a little flag. 0 = closed (flag down), 1 = lid opening,
 * 2 = open with letters inside (flag up).
 */
function mailbox(state: 0 | 1 | 2) {
  const c = new Canvas(16, 24); // last row left clear for the outline
  const rect = (x: number, y: number, w: number, h: number, col: Colour) => {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) c.set(i, j, col);
  };
  // post (its ground shadow is the shared shadow sprite, placed in the scene)
  rect(6, 11, 4, 12, 'wood2');
  rect(6, 11, 1, 12, 'wood3');
  rect(9, 11, 1, 12, 'wood1');
  rect(5, 21, 6, 2, 'wood1'); // little base block
  rect(5, 21, 6, 1, 'wood2');
  // box: arched top, lit from the top-left
  rect(4, 1, 8, 1, 'red1');
  rect(3, 2, 10, 1, 'red1');
  rect(2, 3, 12, 8, 'red1');
  rect(4, 1, 3, 1, 'pink3'); // highlight along the arch
  rect(3, 2, 2, 1, 'pink3');
  rect(2, 3, 1, 7, 'pink2');
  rect(13, 3, 1, 8, 'red0');
  rect(2, 10, 12, 1, 'red0');
  // front door
  rect(4, 4, 8, 6, 'red0');
  if (state === 0) {
    rect(5, 5, 6, 4, 'red1');
    rect(6, 6, 4, 1, 'cream1'); // letter slot
    c.set(10, 8, 'glow1'); // little brass knob
  } else {
    rect(5, 5, 6, 4, 'navy1'); // dark inside
    if (state === 1) {
      rect(5, 8, 6, 2, 'red1'); // door swinging down
    } else {
      rect(5, 9, 6, 2, 'red1'); // door hanging open
      rect(6, 5, 4, 4, 'cream2'); // an envelope…
      c.set(6, 5, 'cream0'); c.set(9, 5, 'cream0'); // …with its flap folded down
      c.set(7, 6, 'cream0'); c.set(8, 6, 'cream0');
      c.set(8, 7, 'pink2'); // sakura seal
    }
  }
  // flag on the right side: down when closed, up when there's mail to read
  if (state === 2) {
    rect(14, 1, 1, 7, 'wood1');
    rect(13, 1, 2, 2, 'pink2');
    c.set(13, 1, 'pink3');
  } else {
    rect(14, 6, 1, 4, 'wood1');
    rect(14, 9, 2, 1, 'pink2');
  }
  return c.seal();
}

export function buildMailbox(): Frame[] {
  return ([0, 1, 2] as const).map(s => ({ name: ['mailbox_closed', 'mailbox_half_open', 'mailbox_open'][s], canvas: mailbox(s) }));
}
