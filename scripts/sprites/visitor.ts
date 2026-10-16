import path from 'node:path';
import { importCharacter } from './character.ts';

/**
 * The visitor (player), from refs/visitor-sheet.png (36 sprites, 4 rows of 9):
 *
 *   row 0:  0–4 front (3 = smiling blink) · 5–8 side (right)
 *   row 1:  9–13 back · 14–17 side (right)
 *   row 2: 18–22 side (left) · 23–26 side (right)
 *   row 3: 27–30 front (28–29 eyes closed) · 31 lying · 32–34 back · 35 lying
 */
export function visitorFrames() {
  return importCharacter(path.join(import.meta.dirname, 'refs/visitor-sheet.png'), {
    rows: 4,
    lying: [31, 35],
    frames: {
      idle_front_0: 0, idle_front_1: [1, -1], idle_front_2: 2, idle_front_3: 3,
      idle_side_0: 5, idle_side_1: [5, -1], idle_side_2: 5, idle_side_3: [5, -1],
      idle_left_0: 18, idle_left_1: [18, -1], idle_left_2: 18, idle_left_3: [18, -1],
      idle_back_0: 9, idle_back_1: [10, -1], idle_back_2: 11, idle_back_3: [12, -1],
      // strides on 6 / 8, passing poses (feet together, body up) on 5 / 7
      walk_side_0: 6, walk_side_1: [5, -1], walk_side_2: 8, walk_side_3: [7, -1],
      walk_left_0: 19, walk_left_1: [20, -1], walk_left_2: 21, walk_left_3: [22, -1],
      walk_back_0: 32, walk_back_1: [34, -1], walk_back_2: 33, walk_back_3: [13, -1],
      walk_front_0: 0, walk_front_1: [1, -1], walk_front_2: 2, walk_front_3: [4, -1],
      faint_0: 0, faint_1: 28, faint_2: [29, 2], faint_3: 31,
    },
  });
}
