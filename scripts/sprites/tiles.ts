import { Canvas, hash, ramp, rng, type Frame } from './lib.ts';
import type { Colour } from './palette.ts';

const T = 16;

// ─── Grass ──────────────────────────────────────────────────────────────────

const TUFT = ['3.3', '.1.'];
const TUFT_KEY: Record<string, Colour> = { '1': 'grass1', '2': 'grass2', '3': 'grass3' };

/**
 * Grass: a flat base with small light patches kept away from the tile edge,
 * so any variant can sit next to any other without a visible seam.
 */
function grass(seed: number, tufts: number, patches = 1) {
  const c = new Canvas(T, T).fill('grass2');
  const r = rng(seed * 97 + 13);
  for (let i = 0; i < patches; i++) {
    const px = 4 + r() * 8, py = 4 + r() * 8, pr = 1.5 + r();
    c.each((x, y) => {
      const d = Math.hypot((x - px) / 1.6, y - py) / pr;
      if (d < 1 && (d < 0.6 || (x + y) % 2 === 0)) c.set(x, y, 'grass3');
    });
  }
  for (let i = 0; i < tufts; i++) {
    const tx = 1 + Math.floor(r() * (T - 5));
    const ty = 1 + Math.floor(r() * (T - 4));
    c.grid(TUFT, TUFT_KEY, tx, ty);
  }
  return c;
}

/** Scatter fallen petals (2px: highlight + shadow) over a canvas. */
function scatterPetals(c: Canvas, seed: number, count: number) {
  const r = rng(seed * 31 + 7);
  for (let i = 0; i < count; i++) {
    const x = 1 + Math.floor(r() * (T - 3));
    const y = 1 + Math.floor(r() * (T - 3));
    c.set(x, y, r() > 0.5 ? 'pink4' : 'pink3');
    if (r() > 0.4) c.set(x + 1, y, 'pink3');
    c.set(x, y + 1, 'pink1');
  }
  return c;
}

// ─── Stone path (4-bit autotile) ────────────────────────────────────────────

/** Seamless cobblestone via wrapped Voronoi cells. */
function cobbles(seed: number) {
  const r = rng(seed);
  const pts: [number, number][] = [];
  for (let gy = 0; gy < 2; gy++)
    for (let gx = 0; gx < 2; gx++) pts.push([(gx + 0.25 + r() * 0.5) * (T / 2), (gy + 0.25 + r() * 0.5) * (T / 2)]);

  const edge = new Uint8Array(T * T);
  const shade = new Float32Array(T * T);
  for (let y = 0; y < T; y++) {
    for (let x = 0; x < T; x++) {
      let d1 = Infinity, d2 = Infinity, cx = 0, cy = 0;
      for (const [px, py] of pts)
        for (const ox of [-T, 0, T])
          for (const oy of [-T, 0, T]) {
            const d = Math.hypot(x + 0.5 - (px + ox), y + 0.5 - (py + oy));
            if (d < d1) { d2 = d1; d1 = d; cx = px + ox; cy = py + oy; } else if (d < d2) d2 = d;
          }
      edge[y * T + x] = d2 - d1 < 1.4 ? 1 : 0;
      // Each stone is a low dome lit from the top-left.
      shade[y * T + x] = ((x + 0.5 - cx) / 5) * -0.6 + ((y + 0.5 - cy) / 5) * -0.8;
    }
  }

  const c = new Canvas(T, T);
  const at = (x: number, y: number) => edge[(((y % T) + T) % T) * T + (((x % T) + T) % T)];
  c.each((x, y) => {
    if (at(x, y)) return c.set(x, y, 'stone1');
    if (at(x, y + 1)) return c.set(x, y, 'stone1'); // underside
    const v = 0.45 + shade[y * T + x] * 0.35 + (hash(x, y, seed) - 0.5) * 0.08;
    c.set(x, y, ramp(['stone2', 'stone3', 'stone4'], v, x, y, 0.2));
  });
  return c;
}

const N = 1, E = 2, S = 4, W = 8;

/**
 * Path tile for a neighbour mask (bit set = neighbour is also path).
 * Edges without a path neighbour get an irregular grass border that lines
 * up with adjacent tiles, and convex corners are rounded.
 */
function pathTile(mask: number, base: Canvas, grassBase: Canvas) {
  const R = 5;
  const c = base.clone();
  const isGrass = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= T || y >= T) return true;
    const ex = Math.min(mask & W ? Infinity : x, mask & E ? Infinity : T - 1 - x);
    const ey = Math.min(mask & N ? Infinity : y, mask & S ? Infinity : T - 1 - y);
    const d = ex < R && ey < R ? R - Math.hypot(R - ex, R - ey) : Math.min(ex, ey);
    // Border width varies along the edge; seeded by position so tiles agree.
    const along = ex <= ey ? y : x;
    const width = 1.5 + (hash(along, ex <= ey ? 1 : 2, 5) > 0.55 ? 1 : 0);
    return d < width;
  };
  c.each((x, y) => {
    if (isGrass(x, y)) {
      c.set(x, y, grassBase.get(x, y));
      // Grass lip catches light where it overhangs the stone below it.
      if (!isGrass(x, y + 1) && y + 1 < T) c.set(x, y, 'grass3');
    } else if (isGrass(x, y - 1) && y > 0) {
      c.set(x, y, 'stone1'); // shadow under the grass lip
    }
  });
  return c;
}

export function buildTiles(): Frame[] {
  const frames: Frame[] = [];
  for (let i = 0; i < 4; i++) frames.push({ name: `grass_${i}`, canvas: grass(i + 1, [0, 1, 1, 2][i], [0, 0, 1, 1][i]) });
  for (let i = 0; i < 3; i++)
    frames.push({ name: `grass_petals_${i}`, canvas: scatterPetals(grass(10 + i, 1, 0), 20 + i, 2 + i * 2) });

  const stones = cobbles(42);
  const grassBase = grass(1, 0, 0);
  for (let mask = 0; mask < 16; mask++) {
    const name = `path_${[mask & N && 'n', mask & E && 'e', mask & S && 's', mask & W && 'w'].filter(Boolean).join('') || 'single'}`;
    frames.push({ name, canvas: pathTile(mask, stones, grassBase) });
  }
  return frames;
}
