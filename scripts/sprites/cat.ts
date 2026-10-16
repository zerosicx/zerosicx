import path from 'node:path';
import { importCharacter } from './character.ts';

/**
 * Yuumi the marbled Bengal, from refs/cat-sheet.png (28 sprites, 7 rows of 4),
 * generated from docs/cat-sprite-prompt.md:
 *
 *   row 1:  0–3  sitting, facing the viewer (1 = tail flick, 3 = blink)
 *   row 2:  4–7  walking toward the viewer
 *   row 3:  8–11 walking left
 *   row 4: 12–15 walking right
 *   row 5: 16–19 walking away
 *   row 6: 20 standing right · 21 tail up · 22 blink · 23 standing left
 *   row 7: 24–25 sitting, seen from behind · 26–27 asleep, curled up (breathing)
 *
 * Anchored on her paws rather than her head (which sits at one end of her body
 * in side views), so she doesn't slide about as her tail moves.
 */
export function catFrames() {
  return importCharacter(path.join(import.meta.dirname, 'refs/cat-sheet.png'), {
    rows: 7,
    factor: 7.5,
    frameH: 34, // tall enough for the raised tail when walking toward the viewer
    anchor: 'feet',
    keepDarkEdges: true, // the art has its own dark line; don't double it
    lying: [],
    // green eyes and pink ears are a handful of pixels: keep their colours
    pin: [[0x6b, 0xa1, 0x3b], [0xa3, 0xdc, 0x65], [0xf7, 0xa4, 0x93], [0xfd, 0xb3, 0xa3]],
    frames: {
      idle_front_0: 0, idle_front_1: 1, idle_front_2: 2, idle_front_3: 3,
      idle_side_0: 20, idle_side_1: 21, idle_side_2: 20, idle_side_3: 22,
      idle_left_0: 23, idle_left_1: 23, idle_left_2: 23, idle_left_3: 23,
      idle_back_0: 24, idle_back_1: 25,
      walk_front_0: 4, walk_front_1: 5, walk_front_2: 6, walk_front_3: 7,
      walk_left_0: 8, walk_left_1: 9, walk_left_2: 10, walk_left_3: 11,
      walk_side_0: 12, walk_side_1: 13, walk_side_2: 14, walk_side_3: 15,
      walk_back_0: 16, walk_back_1: 17, walk_back_2: 18, walk_back_3: 19,
      sleep_0: 26, sleep_1: 27,
    },
  });
}
