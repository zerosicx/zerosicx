import path from 'node:path';
import { importCharacter } from './character.ts';

/**
 * The host character, from refs/host-sheet.png (40 sprites, 4 rows of 10):
 *
 *   row 0:  0–3 front idle · 4 front happy-blink · 5 side (right) stand · 6–9 walk
 *   row 1: 10–14 back · 15–19 front expressions
 *   row 2: 20–24 side (left) walk · 25–29 back walk
 *   row 3: 30–33 back · 34 lying · 35–38 back · 39 lying (other way)
 */
export function hostFrames() {
  return importCharacter(path.join(import.meta.dirname, 'refs/host-sheet.png'), {
    rows: 4,
    lying: [34, 39],
    frames: {
      // idle: gentle sway, a bob, and the happy blink
      idle_front_0: 0, idle_front_1: [1, -1], idle_front_2: 2, idle_front_3: 4,
      idle_side_0: 5, idle_side_1: [5, -1], idle_side_2: 5, idle_side_3: [5, -1],
      idle_left_0: 20, idle_left_1: [20, -1], idle_left_2: 20, idle_left_3: [20, -1],
      idle_back_0: 10, idle_back_1: [11, -1], idle_back_2: 12, idle_back_3: 13,
      // walks
      walk_side_0: 6, walk_side_1: 7, walk_side_2: 8, walk_side_3: 9,
      walk_left_0: 21, walk_left_1: 22, walk_left_2: 23, walk_left_3: 24,
      walk_back_0: 25, walk_back_1: 26, walk_back_2: 27, walk_back_3: 28,
      // no dedicated front walk on the sheet: sway frames with a step bob
      walk_front_0: 0, walk_front_1: [1, -1], walk_front_2: 2, walk_front_3: [3, -1],
      // seated at the desk, from behind: one steady frame with a small typing bob
      sit_0: 12, sit_1: [12, 1], sit_2: 12,
      // reactions
      happy_0: 16, surprised_0: 18, pout_0: 19,
      faint_0: 0, faint_1: 4, faint_2: [4, 2], faint_3: 34,
    },
  });
}
