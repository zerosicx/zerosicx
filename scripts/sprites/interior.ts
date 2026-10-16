import { Canvas, hash, rng, type Frame } from './lib.ts';
import type { Colour } from './palette.ts';

const T = 16;

const rect = (c: Canvas, x: number, y: number, w: number, h: number, col: Colour) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) c.set(i, j, col);
};

/** Recolour a region one step darker (cast shadows on the floor). */
const SHADE: Partial<Record<Colour, Colour>> = { wood4: 'wood3', wood3: 'wood2', wood2: 'wood1', wood1: 'wood0' };
const shadeRect = (c: Canvas, x: number, y: number, w: number, h: number, dither = false) => {
  for (let j = y; j < y + h; j++)
    for (let i = x; i < x + w; i++) {
      if (dither && (i + j) % 2) continue;
      const col = c.get(i, j);
      if (col && SHADE[col]) c.set(i, j, SHADE[col]!);
    }
};

// ─── Room tiles ─────────────────────────────────────────────────────────────

/** Honey-coloured planks, 8 px wide boards with staggered end joints. */
function floor(seed: number) {
  const c = new Canvas(T, T).fill('wood4');
  for (let p = 0; p < 2; p++) {
    const y0 = p * 8;
    rect(c, 0, y0 + 7, T, 1, 'wood3');
    const joint = (Math.floor(hash(p, seed, 3) * 12) + 2 + p * 7) % T;
    for (let y = y0; y < y0 + 7; y++) c.set(joint, y, 'wood3');
    // a couple of soft grain streaks
    const gy = y0 + 2 + Math.floor(hash(p, seed, 4) * 3);
    const gx = Math.floor(hash(p, seed, 5) * 10);
    for (let x = gx; x < gx + 4; x++) if (x !== joint) c.set(x % T, gy, 'wood3');
  }
  return c;
}

/** Top wall: crown moulding, sakura wallpaper, wainscot panel. */
function wallFace() {
  const c = new Canvas(T, T).fill('cream1');
  rect(c, 0, 0, T, 1, 'wood1');
  rect(c, 0, 1, T, 1, 'wood3');
  rect(c, 0, 2, T, 1, 'wood2');
  for (const [fx, fy] of [[4, 5], [12, 9]]) {
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) c.set(fx + dx, fy + dy, 'pink4');
    c.set(fx, fy, 'pink2');
  }
  c.set(12, 4, 'cream0');
  c.set(4, 9, 'cream0');
  rect(c, 0, 11, T, 1, 'wood4');
  rect(c, 0, 12, T, 1, 'wood3');
  rect(c, 0, 13, T, 2, 'wood2');
  c.set(7, 13, 'wood1'); c.set(7, 14, 'wood1');
  c.set(8, 13, 'wood3'); c.set(8, 14, 'wood3');
  rect(c, 0, 15, T, 1, 'wood1');
  return c;
}

/** Wall cap seen from above, `side` = which way the room is. */
function cap(c: Canvas, side: 'right' | 'left' | 'up', from = 0, to = T) {
  for (let a = from; a < to; a++) {
    for (let d = 0; d < 13; d++) {
      const col: Colour = d === 12 ? 'wood0' : d === 11 ? 'wood3' : d === 10 ? 'wood1' : hash(a, d, 9) > 0.96 ? 'wood1' : 'wood2';
      if (side === 'right') c.set(d, a, col); // room is to the right of a left wall
      else if (side === 'left') c.set(T - 1 - d, a, col);
      else c.set(a, T - 1 - d, col);
    }
  }
  return c;
}

function sideWall(side: 'right' | 'left') {
  const c = floor(7);
  shadeRect(c, side === 'right' ? 13 : 0, 0, 3, T, true);
  return cap(c, side);
}

function bottomWall() {
  return cap(floor(8), 'up');
}

function corner(which: 'tl' | 'tr' | 'bl' | 'br') {
  if (which === 'tl') return cap(wallFace(), 'right');
  if (which === 'tr') return cap(wallFace(), 'left');
  const c = cap(floor(8), 'up');
  return cap(c, which === 'bl' ? 'right' : 'left');
}

/**
 * Two-panel sliding shoji door, 32×16. The panels part from the middle and
 * slide behind the wall; `behind` is what shows through the opening.
 */
function door(open: number, behind: Colour) {
  const c = new Canvas(32, T);
  rect(c, 0, 0, 32, T, behind);
  const panel = (x0: number) => {
    rect(c, x0, 0, 16, T, 'wood1');
    rect(c, x0 + 2, 2, 12, 11, 'cream2');
    rect(c, x0 + 2, 2, 12, 1, 'cream0');
    rect(c, x0 + 2, 7, 12, 1, 'wood2'); // kumiko lattice
    rect(c, x0 + 7, 2, 1, 11, 'wood2');
  };
  panel(-open);
  panel(16 + open);
  if (open < 14) {
    c.set(13 - open, 8, 'pink2'); // finger pulls
    c.set(18 + open, 8, 'pink2');
  }
  rect(c, 0, 0, 32, 1, 'wood0'); // lintel
  rect(c, 0, 14, 32, 2, 'wood0'); // sill track
  return c;
}

export function doorFrames(behind: Colour): Frame[] {
  return [
    { name: 'door_closed', canvas: door(0, behind) },
    { name: 'door_half_open', canvas: door(6, behind) },
    { name: 'door_open', canvas: door(13, behind) },
  ];
}

export function roomTiles(): Frame[] {
  return [
    { name: 'floor_0', canvas: floor(1) },
    { name: 'floor_1', canvas: floor(2) },
    { name: 'floor_2', canvas: floor(3) },
    { name: 'wall_top', canvas: wallFace() },
    { name: 'wall_left', canvas: sideWall('right') },
    { name: 'wall_right', canvas: sideWall('left') },
    { name: 'wall_bottom', canvas: bottomWall() },
    { name: 'corner_tl', canvas: corner('tl') },
    { name: 'corner_tr', canvas: corner('tr') },
    { name: 'corner_bl', canvas: corner('bl') },
    { name: 'corner_br', canvas: corner('br') },
  ];
}

// ─── Furniture ──────────────────────────────────────────────────────────────

/** A small potted plant; `bloom` makes it a sakura bonsai. */
function plant(c: Canvas, x: number, y: number, bloom = false) {
  // pot
  rect(c, x + 2, y + 6, 6, 4, 'tan1');
  rect(c, x + 2, y + 6, 6, 1, 'tan2');
  rect(c, x + 3, y + 9, 4, 1, 'tan0');
  if (bloom) {
    rect(c, x + 4, y + 3, 1, 3, 'bark1');
    for (const [dx, dy, col] of [[2, 1, 'pink3'], [3, 0, 'pink4'], [4, 1, 'pink3'], [5, 0, 'pink3'], [6, 1, 'pink2'], [3, 2, 'pink2'], [5, 2, 'pink2'], [1, 2, 'pink3'], [7, 2, 'pink2'], [4, 0, 'pink5']] as const)
      c.set(x + dx, y + dy, col);
  } else {
    for (const [dx, dy, col] of [[4, 0, 'grass3'], [3, 1, 'grass3'], [5, 1, 'grass2'], [2, 2, 'grass2'], [6, 2, 'grass2'], [4, 2, 'grass1'], [1, 3, 'grass2'], [7, 3, 'grass1'], [3, 3, 'grass3'], [5, 3, 'grass2'], [4, 4, 'grass1'], [2, 4, 'grass1'], [6, 4, 'grass1'], [4, 5, 'grass1']] as const)
      c.set(x + dx, y + dy, col);
  }
}

function bookshelf() {
  const c = new Canvas(34, 46);
  plant(c, 22, 0);
  const y0 = 10;
  rect(c, 1, y0, 32, 4, 'wood3'); // top surface
  rect(c, 1, y0, 32, 1, 'wood4');
  rect(c, 1, y0 + 4, 32, 30, 'wood2'); // carcass
  const r = rng(11);
  const books: Colour[] = ['pink2', 'pink1', 'screen2', 'grass2', 'cream1', 'red1', 'eye1', 'glow1', 'pink3', 'tan2'];
  for (let s = 0; s < 3; s++) {
    const sy = y0 + 6 + s * 9;
    rect(c, 3, sy, 28, 7, 'wood0'); // shelf cavity
    let x = 3;
    while (x < 30) {
      const w = r() > 0.7 ? 3 : 2;
      const h = 4 + Math.floor(r() * 3);
      if (r() > 0.85) { x += 2; continue; } // gap
      const col = books[Math.floor(r() * books.length)];
      rect(c, x, sy + 7 - h, Math.min(w, 31 - x), h, col);
      c.set(x, sy + 7 - h, 'cream2');
      x += w;
    }
    rect(c, 1, sy + 7, 32, 1, 'wood3'); // shelf lip
  }
  rect(c, 1, y0 + 34, 32, 1, 'wood1');
  return c.seal();
}

function dresser() {
  const c = new Canvas(30, 32);
  plant(c, 18, 0, true);
  const y0 = 10;
  rect(c, 1, y0, 28, 4, 'wood3');
  rect(c, 1, y0, 28, 1, 'wood4');
  rect(c, 1, y0 + 4, 28, 16, 'wood2');
  for (const dy of [5, 12]) {
    rect(c, 3, y0 + dy, 24, 6, 'wood3');
    rect(c, 3, y0 + dy + 5, 24, 1, 'wood1');
    c.set(10, y0 + dy + 2, 'glow1');
    c.set(19, y0 + dy + 2, 'glow1');
  }
  rect(c, 2, y0 + 20, 2, 2, 'wood1');
  rect(c, 26, y0 + 20, 2, 2, 'wood1');
  return c.seal();
}

function desk() {
  const c = new Canvas(56, 30);
  rect(c, 1, 0, 54, 12, 'wood3'); // top surface (seen from above)
  rect(c, 1, 0, 54, 1, 'wood4');
  for (let x = 4; x < 54; x += 9) c.set(x, 6, 'wood2');
  rect(c, 1, 12, 54, 4, 'wood2'); // apron
  rect(c, 1, 15, 54, 1, 'wood1');
  rect(c, 2, 16, 3, 13, 'wood1'); // legs
  rect(c, 51, 16, 3, 13, 'wood1');
  // mug and a tiny sakura sprig
  rect(c, 45, 3, 4, 4, 'cream2');
  rect(c, 45, 3, 4, 1, 'tan0');
  c.set(49, 4, 'cream2');
  c.set(46, 5, 'pink2');
  for (const [dx, dy, col] of [[6, 2, 'pink3'], [7, 1, 'pink4'], [8, 2, 'pink2'], [7, 3, 'bark1'], [7, 4, 'bark1']] as const) c.set(dx, dy, col);
  return c.seal();
}

/** Monitor + keyboard. Frame 0 = screensaver, 1–4 = code, LEDs vary. */
function computer(frame: number) {
  const c = new Canvas(26, 24);
  rect(c, 2, 0, 22, 16, 'cream1'); // bezel
  rect(c, 2, 15, 22, 1, 'cream0');
  rect(c, 4, 2, 18, 11, frame === 0 ? 'screen1' : 'screen0');
  if (frame === 0) {
    // drifting sakura screensaver
    const fx = 8 + (frame * 3) % 8, fy = 6;
    for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) c.set(fx + dx, fy + dy, 'pink3');
    c.set(fx, fy, 'pink5');
    c.set(17, 9, 'pink3');
    c.set(14, 4, 'pink4');
  } else {
    const r = rng(frame * 17);
    const colours: Colour[] = ['screen2', 'pink3', 'glow1', 'screen3', 'grass3'];
    for (let line = 0; line < 5; line++) {
      const y = 3 + line * 2;
      let x = 5 + (line % 3 === 1 ? 2 : 0);
      const end = 5 + Math.floor(r() * 14);
      while (x < Math.min(end, 21)) {
        const w = 1 + Math.floor(r() * 4);
        const col = colours[Math.floor(r() * colours.length)];
        for (let i = 0; i < w && x + i < 21; i++) c.set(x + i, y, col);
        x += w + 1;
      }
    }
    if (frame % 2) c.set(5 + ((frame * 5) % 12), 11, 'cream2'); // cursor
  }
  c.set(21, 14, frame === 3 ? 'glow0' : 'grass3'); // power LED
  if (frame === 2 || frame === 4) c.set(19, 14, 'glow1'); // disk light
  rect(c, 11, 16, 4, 2, 'cream0'); // stand
  rect(c, 3, 19, 20, 4, 'cream1'); // keyboard
  rect(c, 3, 22, 20, 1, 'cream0');
  for (let x = 4; x < 22; x += 2) { c.set(x, 20, 'stone2'); c.set(x + 1, 21, 'stone2'); }
  return c.seal();
}

/**
 * Desk chair seen from behind: a wide, rounded, cushioned back (wide enough
 * to hide the long hair of whoever sits in it), seat edge and legs.
 */
function chair() {
  const c = new Canvas(32, 26);
  const TOP = 4; // backrest starts here, low enough to show her shoulders
  c.each((x, y) => {
    if (y < TOP || y > 14) return;
    const r = y - TOP;
    // rounded top corners on the backrest
    const inset = r === 0 ? 4 : r === 1 ? 2 : r === 2 ? 1 : 0;
    if (x < 1 + inset || x > 30 - inset) return;
    const frame = x <= 2 || x >= 29 || r <= 1 || y >= 13;
    c.set(x, y, frame ? (r <= 2 ? 'wood3' : 'wood2') : r === 2 ? 'pink4' : y >= 11 ? 'pink2' : 'pink3');
  });
  // tufted buttons on the cushion
  for (const [x, y] of [[10, 8], [16, 8], [22, 8], [13, 10], [19, 10]]) c.set(x, y, 'pink2');
  rect(c, 0, 15, 32, 3, 'wood3'); // seat edge
  rect(c, 0, 17, 32, 1, 'wood1');
  rect(c, 2, 18, 3, 7, 'wood1'); // legs
  rect(c, 27, 18, 3, 7, 'wood1');
  rect(c, 3, 18, 1, 7, 'wood2');
  return c.seal();
}

function bed() {
  const c = new Canvas(36, 52);
  rect(c, 1, 0, 34, 9, 'wood2'); // headboard
  rect(c, 1, 0, 34, 2, 'wood3');
  rect(c, 3, 9, 30, 41, 'cream1'); // mattress
  rect(c, 7, 11, 22, 8, 'cream2'); // pillow
  rect(c, 7, 18, 22, 1, 'cream0');
  rect(c, 3, 21, 30, 4, 'cream2'); // sheet fold
  rect(c, 3, 24, 30, 1, 'cream0');
  rect(c, 3, 25, 30, 23, 'pink3'); // quilt
  rect(c, 3, 25, 30, 1, 'pink4');
  rect(c, 3, 47, 30, 1, 'pink2');
  rect(c, 3, 25, 1, 23, 'pink2');
  rect(c, 32, 25, 1, 23, 'pink2');
  for (let y = 28; y < 46; y += 6)
    for (let x = 7 + ((y / 6) % 2) * 4; x < 31; x += 8) {
      for (const [dx, dy] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) c.set(x + dx, y + dy, 'pink4');
      c.set(x, y, 'pink2');
    }
  rect(c, 1, 48, 34, 4, 'wood2'); // footboard
  rect(c, 1, 48, 34, 1, 'wood3');
  return c.seal();
}

/** Copy only rows [from, to) of a canvas, keeping its size so layers line up. */
function rows(src: Canvas, from: number, to: number) {
  const c = new Canvas(src.w, src.h);
  src.each((x, y, col) => { if (col && y >= from && y < to) c.set(x, y, col); });
  return c;
}

/**
 * The bed is low and flat, so it's drawn in layers rather than y-sorted as one
 * object: the whole bed sits at floor level (characters always draw over it),
 * the headboard is the one tall part and y-sorts on its own, and the blanket
 * (sheet fold down to the footboard) is drawn over whoever is tucked in.
 */
function bedLayers() {
  const full = bed();
  return {
    bed: full,
    'bed-headboard': rows(full, 0, 11),
    'bed-blanket': rows(full, 23, full.h), // from mid-way down the turned-down sheet
  };
}

function rug() {
  const c = new Canvas(76, 44);
  c.each((x, y) => {
    const d = Math.hypot((x - 37.5) / 37, (y - 21.5) / 21);
    if (d >= 1) return;
    c.set(x, y, d > 0.86 ? 'pink2' : d > 0.8 ? 'cream1' : d > 0.5 ? 'pink3' : (x + y) % 2 && d > 0.45 ? 'pink3' : 'pink4');
  });
  // sakura medallion
  const cx = 38, cy = 22;
  for (let a = 0; a < 5; a++) {
    const ang = (a / 5) * Math.PI * 2 - Math.PI / 2;
    const px = Math.round(cx + Math.cos(ang) * 4), py = Math.round(cy + Math.sin(ang) * 3);
    rect(c, px - 1, py - 1, 3, 3, 'cream2');
    c.set(px, py, 'pink3');
  }
  c.set(cx, cy, 'glow1');
  return c;
}

/** Wall window with a sakura branch outside and pink curtains. */
function windowArt() {
  const c = new Canvas(34, 14);
  rect(c, 2, 0, 30, 14, 'wood1');
  rect(c, 3, 1, 28, 11, 'pink4');
  rect(c, 3, 6, 28, 6, 'cream2');
  for (const [x, y, col] of [[18, 2, 'pink2'], [19, 2, 'pink3'], [20, 3, 'pink2'], [21, 2, 'pink3'], [22, 3, 'pink2'], [23, 4, 'pink3'], [24, 3, 'pink2'], [16, 3, 'bark1'], [17, 3, 'bark1'], [18, 4, 'bark1'], [20, 4, 'bark1'], [21, 5, 'bark1'], [22, 5, 'pink3']] as const)
    c.set(x, y, col);
  rect(c, 16, 1, 1, 11, 'wood2'); // mullion
  rect(c, 3, 6, 28, 1, 'wood2');
  rect(c, 0, 0, 6, 13, 'pink3'); // curtains
  rect(c, 28, 0, 6, 13, 'pink3');
  for (let y = 0; y < 13; y += 2) { c.set(2, y, 'pink2'); c.set(31, y, 'pink2'); }
  rect(c, 0, 0, 34, 1, 'pink2');
  rect(c, 1, 13, 32, 1, 'wood3'); // sill
  return c.seal();
}

function clock() {
  const c = new Canvas(12, 12);
  c.each((x, y) => {
    const d = Math.hypot(x - 5.5, y - 5.5);
    if (d < 5.5) c.set(x, y, d > 4.2 ? 'wood2' : 'cream2');
  });
  c.set(5, 3, 'ink'); c.set(5, 4, 'ink'); c.set(5, 5, 'ink'); c.set(6, 5, 'ink'); c.set(7, 5, 'ink');
  c.set(6, 6, 'pink2');
  return c.seal();
}

/** A little Mt Fuji print. */
function painting() {
  const c = new Canvas(16, 12);
  rect(c, 0, 0, 16, 12, 'wood2');
  rect(c, 1, 1, 14, 10, 'pink4');
  rect(c, 1, 7, 14, 4, 'cream1');
  for (let y = 0; y < 6; y++) rect(c, 8 - y - 1, 4 + y, 2 * y + 2, 1, y < 2 ? 'cream2' : 'stone2');
  c.set(12, 3, 'red1'); // sun
  c.set(3, 9, 'pink2'); c.set(4, 9, 'pink3'); c.set(12, 9, 'pink2');
  return c.seal();
}

function pottedPlant() {
  const c = new Canvas(16, 20);
  for (const [x, y, w, col] of [[6, 0, 3, 'grass3'], [3, 2, 4, 'grass2'], [9, 2, 4, 'grass3'], [1, 5, 5, 'grass2'], [10, 5, 5, 'grass2'], [5, 4, 6, 'grass1'], [3, 8, 4, 'grass1'], [9, 8, 4, 'grass2'], [6, 7, 4, 'grass3']] as const)
    rect(c, x, y, w, 2, col);
  rect(c, 7, 9, 2, 3, 'grass1');
  rect(c, 4, 12, 8, 7, 'cream1'); // ceramic pot
  rect(c, 4, 12, 8, 1, 'cream2');
  rect(c, 4, 15, 8, 1, 'pink3');
  rect(c, 5, 18, 6, 1, 'cream0');
  return c.seal();
}

/** Round cushion for the cat to nap on. */
function cushion() {
  const c = new Canvas(26, 12);
  c.each((x, y) => {
    const d = Math.hypot((x - 12.5) / 12.5, (y - 5.5) / 5.5);
    if (d < 1) c.set(x, y, d > 0.75 ? 'red1' : y < 4 ? 'pink4' : 'pink3');
  });
  return c.seal();
}

export function furniture(): Record<string, Canvas> {
  return {
    bookshelf: bookshelf(),
    dresser: dresser(),
    desk: desk(),
    chair: chair(),
    ...bedLayers(),
    rug: rug(),
    window: windowArt(),
    clock: clock(),
    painting: painting(),
    plant: pottedPlant(),
    cushion: cushion(),
  };
}

export function computerFrames(): Frame[] {
  return [0, 1, 2, 3, 4].map(i => ({ name: `computer_${i}`, canvas: computer(i) }));
}
