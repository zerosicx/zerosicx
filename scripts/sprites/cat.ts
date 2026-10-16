import { Canvas, mirror, type Frame } from './lib.ts';
import type { Colour } from './palette.ts';

/**
 * Bengal cat, 24×20 frames. Golden coat with dark rosettes ('x' ring around
 * an 'a' centre), cream muzzle and belly, black-tipped striped tail.
 */
const KEY: Record<string, Colour> = {
  o: 'ink',
  a: 'tan1', A: 'tan2', B: 'tan3', W: 'tan4',
  x: 'tan0',
  g: 'grass4', G: 'ink',
  n: 'pink2', p: 'pink3',
};

// ─── Side (facing right), standing ──────────────────────────────────────────

const SIDE_BODY = [
  '...............o...o....',
  '..............opo.oao...',
  '.............oAAAoAAAo..',
  '.............oAxAxAAAo..',
  '............oAAAAAgGAo..',
  '............oaAAAAAAWo..',
  '.....oooooooaAAAAAWno...',
  '....oBBxBBBxBaaAAWWWo...',
  '...oAAxaxAAxaxAaaWWo....',
  '...oAAAxAAAAxAAAWWo.....',
  '...oaAxaxAAxaxAAWWo.....',
  '....oaaaaaaaaaaaWo......',
]; // rows 2–13

const SIDE_TAIL = [
  ['.o', 'oxo', 'oAo', 'oxo', 'oAo', '.oxo', '..oAo'],
  ['..o', '.oxo', '.oAo', 'oxo', 'oAo', '.oxo', '..oAo'],
]; // rows 3–9, two swish positions

/** Legs: [x, near?] per leg; paws on the bottom row. */
const SIDE_LEGS: [number, boolean][][] = [
  [[5, false], [6, true], [15, false], [16, true]], // standing
  [[4, false], [7, true], [14, false], [17, true]], // stride
  [[7, false], [4, true], [17, false], [14, true]], // other stride
];

function side(opts: { tail?: 0 | 1; legs?: 0 | 1 | 2; blink?: boolean; bob?: number }) {
  const c = new Canvas(24, 20);
  const bob = opts.bob ?? 0;
  for (const [x, near] of SIDE_LEGS[opts.legs ?? 0]) {
    c.set(x, 14, near ? 'tan2' : 'tan1');
    c.set(x, 15, near ? 'tan2' : 'tan1');
    c.set(x, 16, near ? 'tan4' : 'tan1');
  }
  c.grid(SIDE_TAIL[opts.tail ?? 0], KEY, 0, 3 + bob);
  c.grid(SIDE_BODY, KEY, 0, 2 + bob);
  if (opts.blink) {
    c.set(18, 6 + bob, 'tan1');
    c.set(19, 6 + bob, 'ink');
  }
  return c.seal();
}

// ─── Front, sitting ─────────────────────────────────────────────────────────

const FRONT = mirror([
  '.......o....',
  '......opo...',
  '.....oApoooo',
  '.....oAAxAxA',
  '....oAAAAAAA',
  '....oAgGAAAA',
  '....oAAAAWWW',
  '.....oAWWWWn',
  '......oaWWWo',
  '.....oaAAWWW',
  '....oAxaAWWW',
  '....oAAxAWWW',
  '....oaAAaWWW',
  '....oaAaoWWo',
]); // rows 2–15

const FRONT_TAIL = [
  ['.o.', 'oxo', 'oAo', 'oxo'],
  ['..o', '.oxo', 'oAo', 'oxo'],
]; // drawn at x19, rows 11–14

function front(opts: { tail?: 0 | 1; blink?: boolean; paw?: -1 | 0 | 1 }) {
  const c = new Canvas(24, 20);
  c.grid(FRONT_TAIL[opts.tail ?? 0], KEY, 19, 11);
  c.grid(FRONT, KEY, 0, 2);
  if (opts.blink) for (const x of [6, 7, 16, 17]) c.set(x, 7, 'ink');
  if (opts.paw) {
    const x = opts.paw < 0 ? 9 : 13;
    c.set(x, 15, 'ink');
    c.set(x + 1, 15, 'ink');
    c.set(x, 14, 'tan4');
    c.set(x + 1, 14, 'tan4');
  }
  return c.seal();
}

// ─── Back, sitting ──────────────────────────────────────────────────────────

const BACK = mirror([
  '.......o....',
  '......oao...',
  '.....oAaoooo',
  '.....oAAAAAA',
  '....oAAxAAAA',
  '....oAAAAxAA',
  '....oaAAAAAA',
  '.....oaAAAAA',
  '......oAxAAA',
  '.....oAxaxAA',
  '....oAAAxAAA',
  '....oAxaxAAA',
  '....oaAAAAAA',
  '....oaaaoaaa',
]); // rows 2–15

function back(opts: { tail?: 0 | 1; paw?: -1 | 0 | 1 }) {
  const c = new Canvas(24, 20);
  c.grid(BACK, KEY, 0, 2);
  c.grid(FRONT_TAIL[opts.tail ?? 0], KEY, 19, 11);
  if (opts.paw) {
    const x = opts.paw < 0 ? 5 : 15;
    c.set(x, 15, 'ink');
    c.set(x + 1, 15, 'ink');
  }
  return c.seal();
}

// ─── Curled up asleep ───────────────────────────────────────────────────────

const LOAF = [
  '...............o..o.....',
  '........ooooooopooao....',
  '......ooBBxBBBoAAAAAo...',
  '.....oAAxaxAAAoAxAxAAo..',
  '....oAAAAxAAAAoAAooAWo..',
  '....oAxaxAAAAAaAAAWWno..',
  '....oaAAAxAAAAaaAWWWo...',
  '...oxAxAoaaaaaaaaaWo....',
]; // rows 7–14

function loaf(breath: boolean) {
  const c = new Canvas(24, 20).grid(LOAF, KEY, 0, 7);
  if (breath) {
    // Rise the back by a pixel; the belly row stays put.
    const top = c.clone();
    for (let y = 6; y <= 13; y++) for (let x = 0; x < 24; x++) c.set(x, y, top.get(x, y + 1));
  }
  return c.seal();
}

export function catFrames(): Frame[] {
  const f = (name: string, canvas: Canvas) => ({ name, canvas });
  return [
    f('idle_side_0', side({})),
    f('idle_side_1', side({ tail: 1 })),
    f('idle_side_2', side({})),
    f('idle_side_3', side({ blink: true })),
    f('walk_side_0', side({ legs: 1, tail: 1 })),
    f('walk_side_1', side({ bob: -1 })),
    f('walk_side_2', side({ legs: 2, tail: 1 })),
    f('walk_side_3', side({ bob: -1 })),
    f('idle_front_0', front({})),
    f('idle_front_1', front({ tail: 1 })),
    f('idle_front_2', front({})),
    f('idle_front_3', front({ blink: true })),
    f('walk_front_0', front({ paw: -1 })),
    f('walk_front_1', front({ paw: 1, tail: 1 })),
    f('idle_back_0', back({})),
    f('idle_back_1', back({ tail: 1 })),
    f('walk_back_0', back({ paw: -1 })),
    f('walk_back_1', back({ paw: 1, tail: 1 })),
    f('sleep_0', loaf(false)),
    f('sleep_1', loaf(true)),
  ];
}
