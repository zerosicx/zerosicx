import path from 'node:path';
import { importCharacter } from './character.ts';

/**
 * The visitor (player), from refs/visitor-sheet-v2.png (27 sprites, 7 rows of
 * 4), generated from docs/visitor-sprite-prompt.md:
 *
 *   row 1:  0–3  idle front (3 = blink)
 *   row 2:  4–7  walk toward viewer (4, 6 feet together · 5, 7 steps)
 *   row 3:  8–11 walk left          (same rhythm)
 *   row 4: 12–15 walk right
 *   row 5: 16–19 walk away (back)
 *   row 6: 20–23 back idle (22 = head turned slightly)
 *   row 7: 24 happy · 25 surprised · 26 fainted (lying)
 *
 * Bobs are added here ([index, dy]) rather than trusted from the sheet, since
 * frames are re-anchored onto one floor line on import.
 */
export function visitorFrames() {
  return importCharacter(path.join(import.meta.dirname, 'refs/visitor-sheet-v2.png'), {
    rows: 7,
    factor: 5.6,
    pin: [[0xf2, 0xc1, 0x4e], [0xe0, 0x8a, 0x2e]], // the gold star clip is too small to win its own colours
    keepDarkEdges: true, // her art has its own near-black line; adding ours doubled it
    lying: [26],
    frames: {
      idle_front_0: 0, idle_front_1: [0, -1], idle_front_2: 0, idle_front_3: 3,
      idle_side_0: 12, idle_side_1: [12, -1], idle_side_2: 12, idle_side_3: [12, -1],
      idle_left_0: 8, idle_left_1: [8, -1], idle_left_2: 8, idle_left_3: [8, -1],
      idle_back_0: 20, idle_back_1: [20, -1], idle_back_2: 22, idle_back_3: [20, -1],
      // walks: step, passing (body up), other step, passing
      walk_front_0: 5, walk_front_1: [4, -1], walk_front_2: 7, walk_front_3: [6, -1],
      walk_left_0: 9, walk_left_1: [8, -1], walk_left_2: 11, walk_left_3: [10, -1],
      walk_side_0: 13, walk_side_1: [12, -1], walk_side_2: 15, walk_side_3: [14, -1],
      walk_back_0: 17, walk_back_1: [16, -1], walk_back_2: 19, walk_back_3: [18, -1],
      // reactions
      happy_0: 24, surprised_0: 25,
      faint_0: 0, faint_1: 3, faint_2: [3, 2], faint_3: 26,
    },
  });
}
