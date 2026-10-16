import path from 'node:path';
import { importCharacter } from './character.ts';

/**
 * Mitchy, from refs/mitchy-sheet.png (27 sprites, 7 rows of 4), generated from
 * docs/mitchy-sprite-prompt.md:
 *
 *   row 1:  0–3  idle front (3 = blink)
 *   row 2:  4–7  walk toward viewer (4, 6 feet together · 5, 7 steps)
 *   row 3:  8–11 walk left          (same rhythm)
 *   row 4: 12–15 walk right
 *   row 5: 16–19 walk away (back)
 *   row 6: 20–21 back idle · 22–23 playing his handheld
 *   row 7: 24 happy · 25 flustered · 26 shy wave
 */
export function mitchyFrames() {
  return importCharacter(path.join(import.meta.dirname, 'refs/mitchy-sheet.png'), {
    rows: 7,
    factor: 5.6,
    lying: [],
    keepDarkEdges: true, // his art has its own dark line; don't double it
    colours: 32, // he's nearly all near-black: give hair, hoodie and shadow room to separate
    // small details: violet eyes, and the console's screen and grips
    pin: [[0x7f, 0x51, 0xa5], [0xb4, 0x7e, 0xd7], [0x79, 0xc2, 0xee], [0x4f, 0xb0, 0xc0], [0xd2, 0x4c, 0x5f]],
    frames: {
      idle_front_0: 0, idle_front_1: [0, -1], idle_front_2: 0, idle_front_3: 3,
      idle_side_0: 12, idle_side_1: [12, -1], idle_side_2: 12, idle_side_3: [12, -1],
      idle_left_0: 8, idle_left_1: [8, -1], idle_left_2: 8, idle_left_3: [8, -1],
      idle_back_0: 20, idle_back_1: [20, -1], idle_back_2: 21, idle_back_3: [21, -1],
      // walks: step, passing (body up), other step, passing
      walk_front_0: 5, walk_front_1: [4, -1], walk_front_2: 7, walk_front_3: [6, -1],
      walk_left_0: 9, walk_left_1: [8, -1], walk_left_2: 11, walk_left_3: [10, -1],
      walk_side_0: 13, walk_side_1: [12, -1], walk_side_2: 15, walk_side_3: [14, -1],
      walk_back_0: 17, walk_back_1: [16, -1], walk_back_2: 19, walk_back_3: [18, -1],
      play_0: 22, play_1: 23,
      happy_0: 24, flustered_0: 25, wave_0: 26, wave_1: [26, -1],
    },
  });
}
