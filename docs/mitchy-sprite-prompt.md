# Mitchy sprite sheet — image-generation prompt

**Attach two images**, in this order, then paste the prompt below as one message:

1. `scripts/sprites/refs/mitchy-reference.png` — Mitchy's character design
   (hair, face, eyes, hoodie, accessories).
2. `scripts/sprites/refs/host-sheet-v2.png` — the finished host sheet. A
   *different* character: use it only for art style, pixel scale,
   proportions, outline and grid layout, so the two look like they belong in
   the same game.

Save the result to `scripts/sprites/refs/mitchy-sheet.png` (not `dist/`,
which is wiped on every build). If one cell comes back wrong, regenerate with
"Keep everything identical except cell R?C?: …" rather than starting over.

---

```
Create ONE complete pixel-art sprite sheet of the young man in image 1, for a
top-down cozy game. Image 2 is a finished sheet of a DIFFERENT character (a
girl): match its art style, chibi proportions, pixel scale, 1-pixel dark
outline, soft shading and grid layout exactly, but do not copy her design.
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
Rows are counted 0–47 from the top of the cell, columns 0–39 from the left.
- He stands centred: the midpoint between his feet is at art column 20.
- The soles of his shoes rest on art row 46. Every standing frame uses this
  same floor line.
- His full height, top of hair to sole, is 42 art pixels in every standing
  frame (2 px taller than the girl in image 2, whose height is 40).
- His widest point is at most 30 art pixels, so at least 5 art pixels of
  empty white stay between him and each side of the cell. Sprites in
  neighbouring cells must never touch or overlap.

=== CHARACTER (identical in every cell) ===
- Chibi proportions: the head is about half his height, the same head-to-
  body ratio as the girl in image 2.
- Hair: short-to-medium, WAVY, messy and fluffy, JET BLACK with a subtle
  violet sheen on the highlights. Choppy fringe falling over his forehead
  and partly over his eyes; wavy strands sticking out at the sides and the
  back, as in image 1. The hair ends around his jaw and the nape of his
  neck — never past his shoulders.
- Face: calm, slightly sleepy expression; large soft violet eyes with a white
  highlight; pale skin with a light pink blush on the cheeks.
- Accessories: a 1-pixel silver hoop earring on each ear (visible only where
  an ear shows through his hair) and a thin 1-pixel silver chain necklace
  over his hoodie.
- Clothes: an oversized plain BLACK pullover hoodie with the hood down
  behind his neck, two short white drawstrings, a front pocket, and sleeves
  that slightly cover his hands. Loose GREY sweatpants, gathered at the
  ankles. White low-top sneakers with dark soles.
- No hat, no scarf, no bag, no other accessories.

=== STYLE ===
- 1-art-pixel dark outline #2A1B2D around the whole silhouette. Inner lines
  are darker shades of the local colour, not black.
- Light comes from the top-left in every frame.
- Use only these colours (plus white #FFFFFF for the background):
  outline   #2A1B2D
  hair      #1E1B24 #2A2433 #3A3148, violet sheen #5B4B7A #8B7BB5
  hoodie    #1A1820 #24212B #33303C, drawstrings #F2F0F4
  sweatpants #5A5862 #77757F #9896A0
  skin      #F6DAD2, shadow #E7BDB3, blush #D99A97
  eyes      #6A55A0 #8B7BB5, highlight #FFFFFF
  silver    #C9C6D1
  sneakers  #F2F0F4, soles #2A1B2D
  handheld console (row 6 only) body #3A3148, screen #79C2EE,
  left grip #4FB0C0, right grip #D24C5F

=== CONSISTENCY (most important) ===
- His head, face, eyes, hair and hood are the SAME pixels in every frame that
  faces the same direction. Copy them; do not redraw them.
- Only the parts named for a frame may change. Everything else stays fixed.
- "Bob" means the whole character moves up exactly 1 art pixel; nothing else
  changes.
- When a foot lifts, it rises 2 art pixels; the other foot stays on row 46.
- Hair tips may bounce at most 1 art pixel per frame, trailing opposite the
  movement.
- Sideways frames are drawn as real side views, never by mirroring.

=== FRAMES (row by row, left to right) ===
Row 1 — idle, facing the viewer
  C1: standing still, hands in his hoodie pocket, relaxed.
  C2: same as C1, bobbed up 1 art pixel.
  C3: identical to C1.
  C4: identical to C1 but eyes closed (each eye becomes a short curved line).

Row 2 — walking toward the viewer
  C1: standing, feet together (identical to row 1 C1, but arms at his sides).
  C2: his right foot (screen-left) lifted 2 px, left arm slightly forward.
  C3: identical to C1.
  C4: his left foot (screen-right) lifted 2 px, right arm slightly forward.

Row 3 — walking to the LEFT (he faces screen-left; we see his left side and
  one eye)
  C1: standing side view, feet together, arms at his sides.
  C2: front foot (nearer screen-left) stepping forward 2 px and lifted 1 px,
      back foot planted; hair tips bounce 1 px to the right.
  C3: identical to C1.
  C4: the other foot stepping forward (not a mirrored image); hair tips
      bounce 1 px to the right.

Row 4 — walking to the RIGHT (he faces screen-right; we see his right side
  and one eye)
  C1: standing side view, feet together, arms at his sides.
  C2: front foot (nearer screen-right) stepping forward 2 px and lifted 1 px;
      hair tips bounce 1 px to the left.
  C3: identical to C1.
  C4: the other foot stepping forward; hair tips bounce 1 px to the left.

Row 5 — walking AWAY from the viewer (back view: the back of his messy hair,
  the hood lying on his upper back, no face)
  C1: standing, feet together.
  C2: right foot lifted 2 px.
  C3: identical to C1.
  C4: left foot lifted 2 px.

Row 6 — not walking
  C1: back view, standing still (same as row 5, C1).
  C2: same as C1, bobbed up 1 art pixel.
  C3: facing the viewer, looking down at a small handheld game console held
      in both hands at chest height (a short dark rectangle with a light-blue
      screen, a teal grip on the left and a red grip on the right), focused.
  C4: same as C3, both thumbs pressed 1 px lower and the screen 1 px
      brighter, as if mid-game.

Row 7 — reactions, facing the viewer
  C1: happy: same pose as row 1 C1, eyes closed in upward smiling arcs, small
      open grin.
  C2: flustered: same pose as row 1 C1, eyes wide, wobbly mouth, cheeks
      blushing #D99A97 across 2 rows, a small white-and-light-blue sweat
      drop beside his head.
  C3: shy wave: right arm raised beside his head with an open hand (the
      sleeve slipping slightly down), a small awkward smile, eyes looking
      slightly to the side.
  C4: empty — leave the whole cell white.

=== FINAL CHECK BEFORE OUTPUT ===
- 1024 × 1536, white background, 4 × 7 grid, 27 characters, last cell empty.
- Every art pixel is a sharp 4 × 4 block; no blur anywhere.
- All standing frames share the same floor line, the same height (42 art
  px) and the same face.
- Black wavy hair that stops at his jaw, black hoodie, grey sweatpants,
  white sneakers in every frame.
- No two sprites touch. No text anywhere.
```

---

## How the game will use each frame

| Game animation             | Cells     |
| -------------------------- | --------- |
| idle, facing viewer        | R1 C1–C4  |
| walk toward viewer         | R2 C1–C4  |
| walk left                  | R3 C1–C4  |
| walk right                 | R4 C1–C4  |
| walk away                  | R5 C1–C4  |
| idle, back                 | R6 C1–C2  |
| playing on his handheld    | R6 C3–C4  |
| happy · flustered · wave   | R7 C1–C3  |
