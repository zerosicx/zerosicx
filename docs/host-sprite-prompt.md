# Host character sprite sheet — image-generation prompt

**Attach two images**, in this order, then paste the prompt below as one message:

1. `scripts/sprites/refs/host-style-strip.png`: the four front-walk frames we
   liked. This is the style, scale and face to copy.
2. `scripts/sprites/refs/host-sheet.png`: shows her from the side and back.

Save the result to `scripts/sprites/refs/` (not `dist/`, which is wiped on
every build). If the sheet comes back with any cell wrong, regenerate with
"Keep everything identical except cell R?C?: …" rather than starting over.

---

```
Create ONE complete pixel-art sprite sheet of the girl in the attached images,
for a top-down cozy game. Image 1 is the exact art style, scale, face and
outfit to copy. Image 2 shows how she looks from the side and from behind.
Follow every rule below exactly. Do not add, remove or reinterpret anything.

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
- The soles of her boots rest on art row 46 (rows counted 0–47 from the top).
  Every standing frame uses this same floor line.
- Her full height, top of hair to sole, is 40 art pixels in every frame.
- Her widest point (hair) is at most 32 art pixels, so at least 4 art pixels
  of empty white stay between her and each side of the cell. Sprites in
  neighbouring cells must never touch or overlap.

=== CHARACTER (identical in every cell) ===
- Chibi proportions: the head is about half her height.
- Long, wavy pastel-pink hair falling to below her waist, with a blunt fringe
  split by 2–3 strand partings, exactly as in image 1.
- A dark-purple ribbon bow on each side of her head, each with a small
  orange cross-shaped flower clip, exactly as in image 1.
- Large violet eyes with a white highlight in the upper part, light pink
  cheeks, tiny mouth.
- White long-sleeved blouse with a pink bow at the collar; navy pinafore
  dress with two gold buttons and a white frilly hem; dark thigh-high boots
  with an orange ring detail.

=== STYLE ===
- 1-art-pixel dark outline #2A1B2D around the whole silhouette. Inner lines
  are darker shades of the local colour, not black.
- Light comes from the top-left in every frame.
- Use only these colours (plus white #FFFFFF for the background):
  outline #2A1B2D
  hair    #FCE7E3 #FDB0C1 #FCA3BD #F78CB1 #E76EA2 #C3498A #8E2265
  purple (bows, pinafore, boots) #1E0831 #3B235E #5B3F7D #895C9A
  blouse  #FDF6F4 #F7D0D9 #CBAECB
  deep accents and eyes #5F0F49 #6D2D5D
  orange clips, buttons and boot rings: one orange #F29B4B
  skin: #FCE7E3 with #F7D0D9 for blush

=== CONSISTENCY (most important) ===
- Her head, face, eyes, fringe, bows and hair outline are the SAME pixels in
  every frame that faces the same direction. Copy them; do not redraw them.
- Only the parts named for a frame may change. Everything else stays fixed.
- "Bob" means the whole character moves up exactly 1 art pixel; nothing else
  changes.
- When a foot lifts, it rises 2 art pixels; the other foot stays on row 46.
- Hair tips may swing at most 1 art pixel, trailing opposite the movement.
- Sideways frames are drawn as real side views, never by mirroring.

=== FRAMES (row by row, left to right) ===
Row 1 — idle, facing the viewer
  C1: standing still, arms relaxed at her sides (copy image 1, frame 1).
  C2: same as C1, bobbed up 1 art pixel.
  C3: identical to C1.
  C4: identical to C1 but eyes closed (each eye becomes a short curved line).

Row 2 — walking toward the viewer (copy image 1)
  C1: standing, feet together (image 1, frame 1).
  C2: her right foot (screen-left) lifted 2 px (image 1, frame 2).
  C3: standing, feet together, identical to C1.
  C4: her left foot (screen-right) lifted 2 px (image 1, frame 4).

Row 3 — walking to the LEFT (she faces screen-left; we see her left side
  and one eye; the far bow is mostly hidden behind her head)
  C1: standing side view, feet together, arms at her sides.
  C2: front foot (the one nearer screen-left) stepping forward 2 px and
      lifted 1 px, back foot planted; hair tips swing 1 px to the right.
  C3: identical to C1.
  C4: the other foot stepping forward, mirrored timing of C2 (not a mirrored
      image); hair tips swing 1 px to the right.

Row 4 — walking to the RIGHT (she faces screen-right; we see her right side
  and one eye; the far bow is mostly hidden behind her head)
  C1: standing side view, feet together, arms at her sides.
  C2: front foot (nearer screen-right) stepping forward 2 px and lifted 1 px;
      hair tips swing 1 px to the left.
  C3: identical to C1.
  C4: the other foot stepping forward; hair tips swing 1 px to the left.

Row 5 — walking AWAY from the viewer (back view: we see the back of her head
  and her long hair covering her back; both bows visible at the sides; no face)
  C1: standing, feet together.
  C2: right foot lifted 2 px.
  C3: identical to C1.
  C4: left foot lifted 2 px.

Row 6 — back view, not walking
  C1: standing still (same as row 5, C1).
  C2: same as C1, bobbed up 1 art pixel.
  C3: sitting on a chair at a desk, seen from behind: draw ONLY her head,
      shoulders and hair down to art row 32; leave everything below row 32
      empty white (a chair will cover her lower body in the game). Elbows
      angled slightly outward as if typing.
  C4: same as C3 with her head tilted 1 art pixel to the right.

Row 7 — reactions, facing the viewer
  C1: happy: same pose as row 1 C1, eyes closed in upward smiling arcs,
      small open smile.
  C2: surprised: same pose as row 1 C1, eyes a little wider, small round
      open mouth.
  C3: asleep, lying on her back, horizontal: head on the LEFT, feet on the
      RIGHT, eyes closed, hair spread behind her head. Fit inside the cell:
      at most 38 art pixels wide and 20 art pixels tall, resting on row 46.
  C4: empty — leave the whole cell white.

=== FINAL CHECK BEFORE OUTPUT ===
- 1024 × 1536, white background, 4 × 7 grid, 27 characters, last cell empty.
- Every art pixel is a sharp 4 × 4 block; no blur anywhere.
- All standing frames share the same floor line and the same face.
- No two sprites touch. No text anywhere.
```
