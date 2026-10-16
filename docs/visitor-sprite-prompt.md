# Visitor character sprite sheet — image-generation prompt

**Attach two images**, in this order, then paste the prompt below as one message:

1. `scripts/sprites/refs/visitor-sheet.png` — the visitor's design (purple hair).
2. `scripts/sprites/refs/host-sheet-v2.png` — the finished host sheet. A
   *different* character: use it only for art style, scale, proportions and
   layout, so the two characters match in game.

Save the result to `scripts/sprites/refs/visitor-sheet-v2.png` (not `dist/`,
which is wiped on every build). If one cell comes back wrong, regenerate with
"Keep everything identical except cell R?C?: …" rather than starting over.

---

```
Create ONE complete pixel-art sprite sheet of the girl with long purple hair
in image 1, for a top-down cozy game. Image 2 is a finished sheet of a
DIFFERENT character: match its art style, pixel scale, proportions, outline,
shading and grid layout exactly, but do not copy her design. Follow every
rule below exactly. Do not add, remove or reinterpret anything.

=== CANVAS ===
- Output image: exactly 1024 × 1536 pixels, portrait.
- Background: flat pure white #FFFFFF everywhere that is not the character.
  No checkerboard, no shadows on the ground, no gradients, no vignette.
- No text, no labels, no numbers, no frame borders, no grid lines.

=== GRID ===
- The sheet is a grid of 4 columns × 7 rows = 28 cells (27 used, last empty).
- Every art pixel is drawn as a crisp 4 × 4 block of screen pixels
  (nearest-neighbour, no anti-aliasing, no blur, no soft edges).
- Each cell is 40 × 48 art pixels = 160 × 192 screen pixels.
- The whole grid is 640 × 1344 screen pixels, centred on the canvas:
  192 px empty margin on the left and right, 96 px on the top and bottom.
- Cell (row R, column C), both counted from 1, has its top-left corner at
  x = 192 + (C−1)·160, y = 96 + (R−1)·192.

=== PLACEMENT INSIDE EVERY CELL ===
- She stands centred: the midpoint between her feet is at art column 20.
- The soles of her shoes rest on art row 46 (rows counted 0–47 from the top).
  Every standing frame uses this same floor line.
- Her full height, top of hair to sole, is 40 art pixels in every frame —
  the same height as the girl in image 2.
- Her widest point (hair) is at most 32 art pixels, so at least 4 art pixels
  of empty white stay between her and each side of the cell. Sprites in
  neighbouring cells must never touch or overlap.

=== CHARACTER (identical in every cell) ===
- Chibi proportions: the head is about half her height.
- Long, STRAIGHT, glossy purple hair (not wavy) falling straight down to
  below her waist, with a blunt straight-cut fringe just above her eyes and
  straight side locks framing her face down to her chest, as in image 1.
- ONE small gold five-pointed star hair clip, on HER LEFT side of her head,
  just above the fringe line. There is no clip on her right side.
- Large violet eyes with a white highlight in the upper part, light pink
  cheeks, tiny mouth.
- Dark navy sailor-style school uniform: long-sleeved navy top with a white
  stripe along the collar forming a V at the chest and white stripes at the
  cuffs; navy pleated skirt to mid-thigh.
- Bare legs, short white socks, dark rose-red shoes.

=== WHERE THE STAR CLIP APPEARS (she has only one) ===
- Facing the viewer: the clip is on the RIGHT side of the image.
- Facing away (back view): the clip is on the LEFT side of the image.
- Walking left (facing screen-left): we see her left side, so the clip IS
  visible, on the near side of her head.
- Walking right (facing screen-right): we see her right side, so the clip is
  hidden behind her head. Draw no clip in those frames.

=== STYLE ===
- 1-art-pixel dark outline #2A1B2D around the whole silhouette. Inner lines
  are darker shades of the local colour, not black.
- Light comes from the top-left in every frame, with a soft glossy highlight
  band across the top of her hair, as in image 2.
- Use only these colours (plus white #FFFFFF for the background):
  outline #2A1B2D
  hair    #C2A7E2 #9172D6 #8264C9 #6F50B4 #5939A0 #452989 #321A70
  uniform #110829 #271C3D #42315A #524878, white stripes and socks #F1EAF6
  skin    #FAE7E1, shadow #F8C5C0, blush #EA9C99
  eyes    #5835D2 #321A70 with a #FFFFFF highlight
  shoes   #BC5D79 #8E2A45
  star clip #F2C14E #E08A2E

=== CONSISTENCY (most important) ===
- Her head, face, eyes, fringe, clip and hair outline are the SAME pixels in
  every frame that faces the same direction. Copy them; do not redraw them.
- Only the parts named for a frame may change. Everything else stays fixed.
- "Bob" means the whole character moves up exactly 1 art pixel; nothing else
  changes.
- When a foot lifts, it rises 2 art pixels; the other foot stays on row 46.
- Hair ends may swing at most 1 art pixel, trailing opposite the movement.
  Her hair stays straight — it never becomes wavy.
- Sideways frames are drawn as real side views, never by mirroring.

=== FRAMES (row by row, left to right) ===
Row 1 — idle, facing the viewer
  C1: standing still, arms relaxed at her sides.
  C2: same as C1, bobbed up 1 art pixel.
  C3: identical to C1.
  C4: identical to C1 but eyes closed (each eye becomes a short curved line).

Row 2 — walking toward the viewer
  C1: standing, feet together (identical to row 1 C1).
  C2: her right foot (screen-left) lifted 2 px.
  C3: standing, feet together, identical to C1.
  C4: her left foot (screen-right) lifted 2 px.

Row 3 — walking to the LEFT (she faces screen-left; we see her left side,
  one eye, and the star clip on the near side of her head)
  C1: standing side view, feet together, arms at her sides.
  C2: front foot (nearer screen-left) stepping forward 2 px and lifted 1 px,
      back foot planted; hair ends swing 1 px to the right.
  C3: identical to C1.
  C4: the other foot stepping forward (not a mirrored image); hair ends
      swing 1 px to the right.

Row 4 — walking to the RIGHT (she faces screen-right; we see her right side
  and one eye; NO star clip visible)
  C1: standing side view, feet together, arms at her sides.
  C2: front foot (nearer screen-right) stepping forward 2 px and lifted 1 px;
      hair ends swing 1 px to the left.
  C3: identical to C1.
  C4: the other foot stepping forward; hair ends swing 1 px to the left.

Row 5 — walking AWAY from the viewer (back view: the back of her head and
  her long straight hair covering her back down past her waist; no face;
  the star clip on the LEFT side of the image)
  C1: standing, feet together.
  C2: right foot lifted 2 px.
  C3: identical to C1.
  C4: left foot lifted 2 px.

Row 6 — back view, not walking
  C1: standing still (same as row 5, C1).
  C2: same as C1, bobbed up 1 art pixel.
  C3: same as C1 with her head turned very slightly to the right, so the
      edge of her right cheek just shows.
  C4: identical to C1.

Row 7 — reactions, facing the viewer
  C1: happy: same pose as row 1 C1, eyes closed in upward smiling arcs,
      small open smile.
  C2: surprised: same pose as row 1 C1, eyes a little wider, small round
      open mouth.
  C3: fainted, lying on her back, horizontal: head on the LEFT, feet on the
      RIGHT, eyes closed, hair spread behind her head. Fit inside the cell:
      at most 38 art pixels wide and 20 art pixels tall, resting on row 46.
  C4: empty — leave the whole cell white.

=== FINAL CHECK BEFORE OUTPUT ===
- 1024 × 1536, white background, 4 × 7 grid, 27 characters, last cell empty.
- Every art pixel is a sharp 4 × 4 block; no blur anywhere.
- All standing frames share the same floor line and the same face.
- Exactly one star clip, on her left side, placed as listed above.
- Her hair is straight in every frame.
- No two sprites touch. No text anywhere.
```
