# Cat (Yuumi) sprite sheet — image-generation prompt

**Attach one image**, then paste the prompt below as one message:

1. `scripts/sprites/refs/host-sheet-v2.png` — the finished host sheet. Use it
   only for art style, pixel scale, outline and layout; the cat must match it
   so they look like they belong in the same game.

Save the result to `scripts/sprites/refs/cat-sheet.png` (not `dist/`, which
is wiped on every build). If one cell comes back wrong, regenerate with
"Keep everything identical except cell R?C?: …" rather than starting over.

---

```
Create ONE complete pixel-art sprite sheet of a MARBLED BENGAL CAT, for a
top-down cozy game. The attached image is a finished sheet for a girl in the
same game: match its art style, pixel scale, 1-pixel dark outline, soft
top-left lighting and grid layout exactly. Do not draw the girl. Follow
every rule below exactly. Do not add, remove or reinterpret anything.

=== CANVAS ===
- Output image: exactly 1024 × 1536 pixels, portrait.
- Background: flat pure white #FFFFFF everywhere that is not the cat.
  No checkerboard, no shadows on the ground, no gradients, no vignette.
- No text, no labels, no numbers, no frame borders, no grid lines.

=== GRID ===
- The sheet is a grid of 4 columns × 7 rows = 28 cells (all 28 used).
- Every art pixel is drawn as a crisp 4 × 4 block of screen pixels
  (nearest-neighbour, no anti-aliasing, no blur, no soft edges).
- Each cell is 40 × 48 art pixels = 160 × 192 screen pixels.
- The whole grid is 640 × 1344 screen pixels, centred on the canvas:
  192 px empty margin on the left and right, 96 px on the top and bottom.
- Cell (row R, column C), both counted from 1, has its top-left corner at
  x = 192 + (C−1)·160, y = 96 + (R−1)·192.

=== SIZE AND PLACEMENT INSIDE EVERY CELL (art pixels) ===
Rows are counted 0–47 from the top of the cell, columns 0–39 from the left.
- Floor line: every paw that touches the ground rests on row 46.
- The cat is centred horizontally on column 20 (the middle of its body,
  not counting the tail).
- Standing or walking, SIDE view:
    nose to rump 26 px; tail adds up to 8 px more (total width ≤ 34 px);
    top of the back at row 34 (back height 12 px);
    ear tips at row 26 (the cat is 20 px tall from floor to ear tip).
- Standing or walking, FRONT or BACK view:
    body 14 px wide, ear tips at row 28 (18 px tall).
- Sitting, FRONT or BACK view:
    body 16 px wide at the haunches, head 12 px wide,
    ear tips at row 24 (22 px tall). Tail wraps around the front paws.
- Sleeping curled up: a round donut shape 28 px wide × 14 px tall,
  resting on row 46, tail wrapped around to cover the nose.
- Keep at least 3 px of empty white between the cat and every cell edge.
  Sprites in neighbouring cells must never touch or overlap.
- For scale: the cat's ear tips reach about half the girl's height in the
  attached image.

=== THE CAT: a marbled Bengal (identical in every cell) ===
Build and face
- Sleek, muscular, athletic body; long legs; the hindquarters sit slightly
  higher than the shoulders. Thick, medium-length tail with a rounded tip.
- Small, wedge-shaped head; small rounded ears set wide apart.
- Large almond-shaped green-gold eyes with a dark pupil and a 1 px white
  highlight. Thick dark "mascara" lines running from the outer eye corners
  back toward the cheeks.
- Brick-red nose with a dark outline. White-cream muzzle, chin and whisker
  pads. A dark "M" marking on the forehead, with thin stripes running from
  it back over the top of the head.
- Ears: the backs are dark brown with a light "thumbprint" spot in the
  middle; the insides are soft pink.
Coat
- Warm golden-orange base coat, glowing and slightly brighter along the
  back, shading to tawny on the sides.
- MARBLE pattern — not spots, not rosettes, not tiger stripes: large,
  flowing, horizontal swirls along both sides of the body, like marble
  stone or a bullseye that has been stretched sideways. Each swirl is a
  thick dark-brown band (2 px wide) outlined in near-black (1 px) on its
  outer edge, enclosing a rich chestnut-brown interior. Swirls flow from
  the shoulder back toward the hip and curve around the hip.
- A darker stripe along the spine from the back of the head to the tail.
- Belly and inner legs: pale cream with a few small dark spots.
- Legs: 2–3 thin dark horizontal bars on the outer side of each leg.
- Tail: 4 dark rings, and a solid near-black tip (last 3 px).
- Paw pads: dusky pink-brown, visible only when a paw lifts.
- The marble pattern is the SAME on every frame that faces the same way:
  copy it, do not redraw it. The left side and right side each have their
  own pattern (they are not mirror images).

=== PALETTE ===
Use only these colours (plus white #FFFFFF for the background):
  outline              #2A1B2D
  base coat            #F6CC8A (highlight) #E8A85C #D18A3E #B8722E (shadow)
  marble               #8A5530 (interior) #6B3F22 (band) #3B2416 (edge)
  cream belly          #FBE9C7 #F2D6A6
  white muzzle         #FFF6E8
  eyes                 #B7D35A #6F9A2E, pupil #2A1B2D, highlight #FFFFFF
  nose                 #B5584A
  inner ear            #E89A9A
  paw pads             #8A4F4A

=== STYLE ===
- 1-art-pixel dark outline #2A1B2D around the whole silhouette. Inner lines
  are darker shades of the local colour, not black (except the marble
  edges, which are #3B2416).
- Light comes from the top-left in every frame.

=== ANIMATION RULES ===
- Walk cycle (4 frames): diagonal leg pairs move together. Frame 1: front
  left and back right legs forward. Frame 2: passing, all four legs under
  the body, body up 1 px. Frame 3: front right and back left legs forward.
  Frame 4: passing again, body up 1 px.
- A lifted paw rises 2 px; planted paws stay on row 46.
- Tail moves at most 2 px per frame and always curves smoothly.
- "Blink" means only the eyes change: each eye becomes a 1 px dark line.
- Only the parts named for a frame change; everything else stays fixed.
- Sideways frames are real side views, never mirrored copies.

=== FRAMES (row by row, left to right) ===
Row 1 — sitting, facing the viewer
  C1: sitting upright, tail wrapped around the front paws to the right.
  C2: same as C1, tail tip flicked up 2 px.
  C3: identical to C1.
  C4: identical to C1, eyes blinking.

Row 2 — walking toward the viewer (front view, head up, tail raised
  behind and just visible above the back)
  C1–C4: the four-frame walk cycle above.

Row 3 — walking to the LEFT (side view, facing screen-left; we see her
  left side; tail held up in a relaxed curve behind)
  C1–C4: the four-frame walk cycle above.

Row 4 — walking to the RIGHT (side view, facing screen-right; we see her
  right side and its own marble pattern)
  C1–C4: the four-frame walk cycle above.

Row 5 — walking away from the viewer (back view: back of the head, ears,
  spine stripe, marbled flanks, ringed tail raised in the middle)
  C1–C4: the four-frame walk cycle above.

Row 6 — standing still, side view
  C1: facing right, all four paws on the ground, tail in a low curve.
  C2: same as C1, tail curving up 2 px higher.
  C3: same as C1, eyes blinking.
  C4: facing left (same pose, her left side), all four paws down.

Row 7 — resting
  C1: sitting, seen from behind (facing away), tail curled around to the
      right on the floor.
  C2: same as C1, tail tip flicked up 2 px.
  C3: asleep, curled into a donut, eyes closed, tail over the nose.
  C4: same as C3, breathing in: the top of her back 1 px higher.

=== FINAL CHECK BEFORE OUTPUT ===
- 1024 × 1536, white background, 4 × 7 grid, 28 cats.
- Every art pixel is a sharp 4 × 4 block; no blur anywhere.
- Every frame shows a MARBLED Bengal: horizontal swirling marble bands on
  golden-orange, white muzzle, mascara lines, ringed tail with a black tip.
- All paws that touch the floor sit on the same floor line (row 46).
- Same size in every frame; no two sprites touch; no text anywhere.
```

---

## How the game uses each frame

| Game animation   | Cells             |
| ---------------- | ----------------- |
| `cat-idle-forward` | R1 C1–C4        |
| `cat-walk-forward` | R2 C1–C4        |
| `cat-walk-left`    | R3 C1–C4        |
| `cat-walk-side` (right) | R4 C1–C4   |
| `cat-walk-back`    | R5 C1–C4        |
| `cat-idle-side` (right) | R6 C1–C3   |
| `cat-idle-left`    | R6 C4           |
| `cat-idle-back`    | R7 C1–C2        |
| `cat-sleep`        | R7 C3–C4        |
