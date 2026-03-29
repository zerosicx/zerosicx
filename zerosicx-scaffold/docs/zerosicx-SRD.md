# zerosicx — Software Requirements Document
**Version**: 1.1
**Author**: Hannah
**Status**: Draft
**Last Updated**: 2026-03-29

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Philosophy & Aesthetic](#2-design-philosophy--aesthetic)
3. [Tech Stack](#3-tech-stack)
4. [Repository Structure](#4-repository-structure)
5. [Content Schema](#5-content-schema)
6. [Feature Specifications](#6-feature-specifications)
   - 6.1 [First Visit — Welcome Dialogue](#61-first-visit--welcome-dialogue)
   - 6.2 [The Bedroom (Home)](#62-the-bedroom-home)
   - 6.3 [The Garden (Blog)](#63-the-garden-blog)
   - 6.4 [Projects Page](#64-projects-page)
   - 6.5 [Navigation & Room Transitions](#65-navigation--room-transitions)
7. [Interaction System](#7-interaction-system)
8. [Dialogue System](#8-dialogue-system)
9. [Data Pipeline](#9-data-pipeline)
10. [Deployment & CI/CD](#10-deployment--cicd)
11. [Asset Specifications](#11-asset-specifications)
12. [Development Phases](#12-development-phases)
13. [Open Questions & Future Scope](#13-open-questions--future-scope)

---

## 1. Project Overview

**zerosicx** is a personal website styled as a playable pixel-art world, inspired by the look and feel of classic Pokémon games (Gen III/IV top-down perspective) and the cosy aesthetic of Stardew Valley. Rather than a conventional personal portfolio, visitors navigate through interactive pixel-art environments that represent different facets of the owner's life and work.

The world currently consists of two spaces:

| Space | Real-world analogue |
|---|---|
| **The Bedroom** | Home / About Me page |
| **The Garden** | Blog / Things I'm Learning |

A **Projects** section is reachable from within the bedroom (via the computer desk).

### Core Principles

- **Cosy, not complex.** Interactions should feel delightful and low-friction.
- **Content first.** The game wrapper enhances the content; it never obscures it.
- **Markdown everywhere.** All content is written in `.md` files — no CMS, no dashboards.
- **Easy to maintain.** Adding a new blog post = dropping one file into the repo.

---

## 2. Design Philosophy & Aesthetic

### Visual Style

- **Art style**: Top-down pixel art, 16×16 tile grid
- **Resolution**: Game world rendered at native pixel resolution, scaled 3× or 4× for modern screens (no anti-aliasing — crisp pixels only)
- **Palette**: Primarily pinks, mauves, and warm creams. Accent with soft greens in the garden. Dark outlines for character and objects
- **Lighting**: Flat, daylight interior lighting for the bedroom. Soft dappled outdoor lighting for the garden (subtle animated overlays optional)
- **UI**: Pixel-art dialogue boxes styled after Gen III Pokémon (dark border, light inner fill, pixel font). Semi-transparent overlays for non-game content panels

### Tone

- Warm, friendly, a little playful
- The persona/character IS Hannah — the player embodies the site's creator
- Dialogue is written in first person ("Welcome to my little corner of the internet!")

### Inspiration References

- **Pokémon FireRed/LeafGreen** — bedroom layout, NPC dialogue, tile transitions
- **Stardew Valley** — garden aesthetics, cosy colour palette, proximity-based UI
- **Bruno Simon's portfolio** (brunosimon.com) — game-as-portfolio concept
- **ariroffe's personal website** — closest direct reference: Phaser 3 Pokémon-style personal site ([github.com/ariroffe/personal-website](https://github.com/ariroffe/personal-website))

---

## 3. Tech Stack

### Decision Summary

After researching all major options (Phaser.js, Kaboom.js, Excalibur.js, Tiled + custom canvas, React + game loop, plain canvas), the recommended stack is:

| Layer | Technology | Rationale |
|---|---|---|
| **Game engine** | [Phaser 3](https://phaser.io/) | Mature, actively maintained, native Tiled support, top-down RPG tutorials abundant, pixel-art mode, TypeScript support |
| **Build tool** | [Vite](https://vitejs.dev/) | Fast dev server, tree-shaking, `import.meta.glob` for markdown, no framework lock-in |
| **Language** | TypeScript | Type safety; Phaser 3 ships with TS types |
| **CSS framework** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling for all HTML UI overlays (dialogue boxes, article panels, project cards, sidebar). Does **not** touch the Phaser canvas. |
| **Map editor** | [Tiled Map Editor](https://www.mapeditor.org/) | Industry standard; exports JSON consumed by Phaser |
| **Markdown parsing** | [marked](https://marked.js.org/) + [gray-matter](https://github.com/jonschlinkert/gray-matter) | Minimal bundle (~50KB total), fast, zero CMS overhead |
| **Sprite authoring** | [Piskel](https://www.piskelapp.com/) (free, browser) → [LibreSprite](https://libresprite.github.io/) (advanced) | Free, open-source; Aseprite is the pro option if needed |
| **Hosting** | [Netlify](https://netlify.com/) | Simple GitHub integration, 100GB free bandwidth, preview deploys, no enterprise GitHub auth required |
| **CI/CD** | GitHub Actions | Auto-deploy on push; can watch for new markdown files |

### Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Browser                         │
│                                              │
│  ┌──────────────┐   ┌──────────────────────┐ │
│  │  Phaser 3    │   │   HTML UI Layer      │ │
│  │  Canvas      │   │  styled w/ Tailwind  │ │
│  │  (game world)│   │  (Dialogue, Sidebar, │ │
│  └──────┬───────┘   │   Content panels)    │ │
│         │           └──────────────────────┘ │
│         │ events / camera position           │
└─────────┼───────────────────────────────────┘
          │
   ┌──────▼──────────────────────┐
   │  Vite Build Pipeline        │
   │  import.meta.glob('**/*.md')│
   │  → gray-matter (frontmatter)│
   │  → marked (body HTML)       │
   └─────────────────────────────┘
          │
   ┌──────▼──────────────────────┐
   │  /content/                  │
   │    articles/  *.md          │
   │    projects/  *.md          │
   └─────────────────────────────┘
```

Phaser handles all game logic and renders to a `<canvas>`. Non-game UI (dialogue boxes, content reading panels, project cards, the article sidebar) are HTML `<div>` elements overlaid on the canvas, driven by Phaser events, and styled entirely with **Tailwind CSS**. This is a clean separation of concerns: Phaser owns pixels, Tailwind owns prose. Tailwind v4 integrates natively with Vite via `@tailwindcss/vite` — no PostCSS config required.

---

## 4. Repository Structure

```
zerosicx/
├── content/                  # All site content (markdown)
│   ├── articles/             # Blog posts
│   │   ├── 2025-01-15-hello-world.md
│   │   └── 2025-03-10-learning-rust.md
│   └── projects/             # Projects
│       ├── canva-design-tool.md
│       └── zerosicx-website.md
│
├── public/                   # Static assets served as-is
│   ├── assets/
│   │   ├── tilesets/         # PNG tilesets (bedroom, garden)
│   │   ├── sprites/          # Character + object spritesheets
│   │   ├── ui/               # Dialogue box frames, icons
│   │   └── audio/            # Ambient sounds (optional)
│   └── maps/                 # Tiled .tmj exports (JSON)
│       ├── bedroom.tmj
│       └── garden.tmj
│
├── src/
│   ├── main.ts               # Phaser game initialisation
│   ├── scenes/               # One file per room/scene
│   │   ├── BootScene.ts      # Load assets, check localStorage
│   │   ├── WelcomeScene.ts   # First-visit dialogue
│   │   ├── BedroomScene.ts   # Main home room
│   │   └── GardenScene.ts    # Blog garden
│   ├── systems/              # Reusable game systems
│   │   ├── DialogueSystem.ts # Dialogue box rendering & sequencing
│   │   ├── PlayerController.ts # Arrow keys + click-to-walk
│   │   ├── InteractionSystem.ts # Proximity detection + triggers
│   │   └── ContentPanel.ts   # HTML overlay for article/project display
│   ├── data/
│   │   └── content-loader.ts # Imports and parses all markdown via glob
│   └── ui/                   # HTML overlay components (vanilla TS)
│       ├── DialogueBox.ts
│       ├── ArticlePanel.ts
│       └── ProjectCard.ts
│
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .github/
    └── workflows/
        └── deploy.yml        # Cloudflare Pages auto-deploy
```

---

## 5. Content Schema

All content is written as Markdown files with YAML frontmatter.

### 5.1 Article (Blog Post)

**File location**: `content/articles/YYYY-MM-DD-slug.md`

```yaml
---
title: "Learning Rust by Building a CLI"
date: 2025-03-10
tags:
  - learning
  - rust
  - programming
references:
  - title: "The Rust Book"
    url: "https://doc.rust-lang.org/book/"
  - title: "Rustlings"
    url: "https://github.com/rust-lang/rustlings"
---

Body content in Markdown here...
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Displayed in garden and reading panel |
| `date` | YYYY-MM-DD | ✅ | Used for sorting and flower placement order |
| `tags` | string[] | ✅ | Determines which "patch" of garden the flower appears in |
| `references` | {title, url}[] | ❌ | Shown at the bottom of the article reading panel |

**Garden representation**: Each article = one flower. Flower type/colour can be varied based on tag or be randomly seeded by slug.

### 5.2 Project

**File location**: `content/projects/slug.md`

```yaml
---
title: "zerosicx Personal Website"
description: "A Pokemon-style personal website built with Phaser 3."
date_start: 2026-03
date_end: present
tags:
  - personal
  - web
  - hackathon
status: active          # active | completed | archived
featured: true          # appears prominently on projects screen
---

Longer description / writeup in Markdown here (optional)...
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | |
| `description` | string | ✅ | Short blurb shown in the project card |
| `date_start` | YYYY-MM | ✅ | |
| `date_end` | YYYY-MM or "present" | ✅ | |
| `tags` | string[] | ✅ | Categories: personal, company, hackathon, school, etc. |
| `status` | enum | ✅ | |
| `featured` | boolean | ❌ | Defaults to false |

### 5.3 Tag Taxonomy (Initial)

Tags are freeform strings but the following are recommended for consistency:

**For articles**: `learning`, `programming`, `design`, `thoughts`, `life`, `tools`, `reading`

**For projects**: `personal`, `work`, `hackathon`, `school`, `open-source`, `side-project`

---

## 6. Feature Specifications

### 6.1 First Visit — Welcome Dialogue

**Trigger**: User visits the site for the first time (no `zerosicx_visited` key in `localStorage`).

**Flow**:

1. Game loads, `BootScene` checks `localStorage`.
2. If first visit → transition to `WelcomeScene` before showing the bedroom.
3. `WelcomeScene` renders a static or lightly animated background (could be the bedroom, slightly dimmed).
4. A Pokémon-style dialogue box appears at the bottom of the screen.
5. A sprite of Hannah's persona appears (talking animation — mouth opens/closes, or just a portrait).
6. Dialogue sequence plays (player presses Space/Enter or clicks to advance):

```
> "Oh! A visitor! Hi there 👋"
> "Welcome to zerosicx — my little corner of the internet."
> "This is my room. Feel free to look around!"
> "You can use the arrow keys to walk, or just click
   somewhere and I'll head over."
> "Let me know if you find the cat. She's around here somewhere..."
> "[PRESS SPACE TO CONTINUE]"
```

7. After dialogue ends → set `localStorage.setItem('zerosicx_visited', 'true')` → transition to `BedroomScene`.

**Returning visitors**: `BootScene` detects the flag → skips `WelcomeScene` → goes straight to `BedroomScene`.

**Reset option**: A hidden interaction (e.g., clicking the bookshelf a certain number of times) clears `localStorage` and allows replaying the welcome.

---

### 6.2 The Bedroom (Home)

The bedroom is the main hub of the website. It is a top-down pixel-art room rendered from a Tiled tilemap.

#### 6.2.1 Room Layout (Conceptual)

```
┌──────────────────────────────────────────┐
│  [Bookshelf]  [Pinboard]   [Window]       │
│                                           │
│  [Computer Desk]        [Decorations]     │
│                   [Cat]                   │
│         [Player Spawn]                    │
│                                           │
│  [Bed]              [Side Table/Lamp]     │
│                                           │
│  ═══════════════[DOOR TO GARDEN]══════════│
└──────────────────────────────────────────┘
```

#### 6.2.2 Interactive Objects

| Object | Interaction | Destination / Outcome |
|---|---|---|
| **Computer** | Walk up + press Space / click | Opens Projects page (HTML overlay panel, or new scene) |
| **Pinboard** | Walk up + press Space / click | Dialogue: a pinned note about Hannah, links, or latest update |
| **Bookshelf** | Walk up + press Space / click | Dialogue: "Currently reading..." or favourite books list |
| **Cat** | Walk near / click | Short cat dialogue ("Mrow.") — charming Easter egg |
| **Bed** | Walk up + press Space / click | Dialogue: fun/quirky idle message ("Zzz... not now.") |
| **Window** | Walk up + press Space / click | Dialogue: a haiku or note about the weather/season |
| **Decorations** | Optional | Small flavour dialogue for each |
| **Door (south)** | Walk through / approach | Transition to Garden scene |

#### 6.2.3 Player Movement

- **Arrow keys**: Move player in 4 directions (up, down, left, right). Tile-snapped movement.
- **Click-to-walk**: Click anywhere on the map → character pathfinds to that tile and walks there. Uses Phaser's built-in pathfinding or a simple A* plugin.
- **Collision**: Furniture tiles marked as solid in Tiled (collision layer). Player cannot walk through them.
- **Walk animation**: 4-directional walk cycle (down, up, left, right). Idle frame when stationary.
- **Walk speed**: ~2–3 tiles/second. Should feel deliberate and cute, not sluggish.

---

### 6.3 The Garden (Blog)

The Garden is the blog section of the website, navigated by walking from the bedroom through the door heading south.

#### 6.3.1 Layout Concept

```
            ← ← ← [BACK TO BEDROOM] ← ← ←

  [Signpost: "Latest Posts"]

  [Flower Patch A: #learning]   [Flower Patch B: #design]
      🌸 🌸 🌺                      🌼 🌸

  [Flower Patch C: #thoughts]   [Flower Patch D: #programming]
      🌷 🌷                          🌻 🌻 🌻

                  [ Bench / Reading area ]

  [Older flowers grow further from entrance — more recent = closer]
```

#### 6.3.2 Flower System

- **1 article = 1 flower**. Flowers are placed in the garden upon each new article.
- Flowers are grouped by **tag** into patches/beds. Each tag gets its own patch.
- The more articles in a tag, the larger that patch grows.
- Flower type/variant can be determined by tag:
  - `#learning` → 🌸 pink blossom
  - `#programming` → 🌻 sunflower
  - `#design` → 🌺 red flower
  - `#thoughts` → 🌷 tulip
  - etc.
- Flowers within a patch are laid out in a grid or organically scattered.

#### 6.3.3 Proximity-Based Article Preview

- As the player walks near a flower, the corresponding article appears in a **right-side panel** (HTML overlay).
- Panel shows: title, date, tags, first 200 characters of content, "Read more →" button.
- Clicking "Read more →" opens the full article in an expanded overlay panel.
- Proximity threshold: ~2 tiles.
- The closest flower to the player determines the displayed article.

#### 6.3.4 Signpost Interaction

- There is a signpost at the entrance to the garden.
- Interacting with it opens a **chronological list** of the 5 most recent articles (as an overlay panel).
- Acts as a quick "what's new" entry point.

#### 6.3.5 Navigation Back

- Walking north (towards the bedroom door) transitions back to the `BedroomScene`.

---

### 6.4 Projects Page

Projects are accessed from the **computer desk** in the bedroom.

#### 6.4.1 Interaction Flow

1. Player walks to the computer desk and presses Space / clicks.
2. A "sitting down" animation plays (optional).
3. A full-screen or large HTML overlay panel slides in, styled as a computer screen/monitor.
4. The Projects panel shows a list of projects, filterable by tag.

#### 6.4.2 Projects Display

- Projects are listed as cards, each showing: title, description, date range, tags, status badge.
- `featured: true` projects appear at the top.
- Filter row at the top: click tags to filter (e.g. "personal", "work", "hackathon").
- Clicking a project card expands it to show the full markdown body (if present).
- Styled to look like a retro computer/terminal interface (pixel font, dark background, pink accents) — or a cute pastel desktop UI. TBD on final style.

---

### 6.5 Navigation & Room Transitions

- Transitioning between rooms uses a **fade to black** effect (classic Pokémon style).
- Player enters from the equivalent edge of the new room (e.g., exiting the south door of the bedroom → appears at north edge of garden).
- Scene transitions are managed by Phaser's Scene Manager.
- A subtle sound effect plays on room transition (optional, respects a mute toggle).

---

## 7. Interaction System

All interactive objects follow the same pattern:

1. **Detection zone**: Each interactive object has a collision/trigger zone defined in Tiled (as an object layer).
2. **Proximity indicator**: When the player is within 1.5 tiles, a small "!" or action prompt appears above the object (pixel-art speech bubble or icon).
3. **Trigger**: Player presses Space / Enter, or clicks the object.
4. **Response**: Dialogue fires, overlay opens, or scene transitions.

### Click-to-Walk on Objects

When a player clicks on an interactive object rather than an empty tile:
- The character walks to the interaction zone of that object.
- Upon arrival, the interaction triggers automatically.

### Interaction Priority

If the player is within range of multiple objects, the closest one takes priority.

---

## 8. Dialogue System

Inspired by Pokémon Gen III dialogue boxes.

### Visual Spec

- Fixed to the **bottom of the screen** (not the game world — it's a UI overlay).
- Box dimensions: full width, ~4 lines tall.
- Pixel font (e.g., Dogica, Pixel Operator, or Press Start 2P).
- Dark border, light cream/white inner fill, pink accent elements.
- Optional: Small portrait of Hannah's persona appears in the bottom-left corner of the dialogue box for "Hannah speaks" dialogue.
- Text appears character-by-character ("typewriter" effect) at a comfortable reading pace.
- "▼" blinking indicator at the bottom-right when waiting for player input.

### Dialogue Data Format

Dialogues are defined in TypeScript as arrays of strings (one string per box):

```typescript
const welcomeDialogue: string[] = [
  "Oh! A visitor! Hi there 👋",
  "Welcome to zerosicx — my little corner of the internet.",
  "This is my room. Feel free to look around!",
  "Use the arrow keys to walk, or just click and I'll head over.",
  "Let me know if you find the cat. She's around here somewhere..."
];
```

### Controls

- **Space / Enter / Click**: Advance to next line, or skip typewriter animation if still typing.
- **Escape**: Skip entire dialogue (where permitted).

### Dialogue State Machine

```
IDLE → TRIGGERED → TYPING → WAITING_FOR_INPUT → [next line or COMPLETE] → IDLE
```

---

## 9. Data Pipeline

### How Content Gets Into the Game

1. Hannah drops a new `.md` file into `content/articles/` or `content/projects/`.
2. Vite's `import.meta.glob` imports all matching markdown files at build time.
3. `gray-matter` parses YAML frontmatter into a typed object.
4. `marked` converts the body to HTML.
5. The result is a typed `Article[]` or `Project[]` array available throughout the app.
6. For the garden: the article list drives the flower placement — each article = one flower object added to the `GardenScene`.

### Content Loader (pseudocode)

```typescript
// src/data/content-loader.ts
const articleFiles = import.meta.glob('/content/articles/*.md', { as: 'raw' });

export async function loadArticles(): Promise<Article[]> {
  const articles = await Promise.all(
    Object.entries(articleFiles).map(async ([path, loader]) => {
      const raw = await loader();
      const { data, content } = matter(raw);
      return {
        slug: path.replace(/.*\//, '').replace('.md', ''),
        title: data.title,
        date: new Date(data.date),
        tags: data.tags ?? [],
        references: data.references ?? [],
        body: marked(content),
      } as Article;
    })
  );
  return articles.sort((a, b) => b.date.getTime() - a.date.getTime());
}
```

### CI Trigger (Future)

A GitHub Actions workflow can be set to trigger specifically on new files in `/content/articles/` — logging a notification, re-deploying, or running validation.

---

## 10. Deployment & CI/CD

### Hosting: Netlify

- Connect the GitHub repository to Netlify (or use the GitHub Actions workflow — see below).
- Build command: `npm run build` (Vite outputs to `/dist`).
- Output directory: `dist`.
- Custom domain: configurable in Netlify dashboard.
- Environment: No server-side required — fully static.
- Note: Chosen over Cloudflare Pages to avoid enterprise GitHub App auth conflicts.

### GitHub Actions: Auto Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: nwtgck/actions-netlify@v3
        with:
          publish-dir: './dist'
          production-branch: main
          production-deploy: true
          github-token: ${{ secrets.GITHUB_TOKEN }}
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

**Required GitHub Secrets**:
- `NETLIFY_AUTH_TOKEN` — Netlify → User Settings → Personal Access Tokens
- `NETLIFY_SITE_ID` — Netlify → Site → Site Configuration → Site ID

### Publishing Workflow

```
Write markdown → git add → git commit → git push → GitHub Actions → Cloudflare Pages rebuild → live
```

Total deploy time: ~1–2 minutes.

---

## 11. Asset Specifications

### Tile Grid

- **Tile size**: 16×16 pixels
- **Scale**: Rendered at 3× or 4× (game runs at ~320×240 logical resolution, scaled to fill viewport)
- **Map format**: Tiled JSON (.tmj) — loaded by Phaser via `this.make.tilemap()`

### Tilesets (Recommended Sources)

| Asset | Source | Notes |
|---|---|---|
| Bedroom interior | [Penzilla — Top-Down Retro Interior](https://penzilla.itch.io/top-down-retro-interior) | Bed, desk, furniture |
| Garden / outdoor | [Open Pixel Project](https://www.openpixelproject.com/) | 2000+ tiles |
| Flowers | Custom or OpenGameArt | One sprite per article tag |
| General objects | [itch.io Modern Interiors 16x16](https://limezu.itch.io/moderninteriors) | Popular, well-maintained |

### Character Sprite

- Hannah's persona: a pixel-art character (female-presenting, customisable for pink theme).
- **Walk cycle**: 4-directional, 4 frames each = 16-frame spritesheet.
- **Idle**: 1 frame per direction (use frame 0 of each direction).
- Recommended starting point: [Anokolisa's Top-Down Asset Pack](https://anokolisa.itch.io/free-pixel-art-asset-pack-topdown-tileset-rpg-16x16-sprites), then recolour.
- Long term: Custom sprite made in LibreSprite or commissioned.

### Fonts

- **Dialogue / game UI**: [Dogica](https://www.dafont.com/dogica.font) or [Pixel Operator](https://www.dafont.com/pixel-operator.font)
- **Content panels (articles/projects)**: System font stack or a legible web font (e.g. Inter) — pixel fonts are too low-readability for long-form text.

### Audio (Optional, Phase 2)

- Ambient bedroom BGM (lo-fi chiptune)
- Ambient garden BGM (soft outdoor chiptune)
- UI sounds: dialogue advance click, door transition
- Cat meow sound effect
- A mute toggle button always visible in the corner.

---

## 12. Development Phases

### Phase 1 — Foundation & Bedroom MVP
**Goal**: A working bedroom scene the player can navigate.

- [ ] Set up Vite + TypeScript + Phaser 3 + Tailwind CSS v4 project
- [ ] Implement basic PlayerController (arrow keys + click-to-walk)
- [ ] Create Bedroom tilemap in Tiled, export to JSON, load in Phaser
- [ ] Add collision layer and object layer in Tiled
- [ ] Implement basic DialogueSystem (typewriter effect, advance on Space)
- [ ] Hook up Welcome Dialogue + localStorage first-visit check
- [ ] Add placeholder sprites for all interactive objects
- [ ] Wire up each object to a dialogue (cat, bed, bookshelf, window, computer, pinboard)

**Deliverable**: A navigable pink bedroom where all objects trigger dialogue. Deployable to Cloudflare Pages.

---

### Phase 2 — Content Pipeline & Garden
**Goal**: Blog garden is live and articles are displayed.

- [ ] Set up `content/articles/` folder with sample `.md` files
- [ ] Implement `content-loader.ts` with Vite glob + gray-matter + marked
- [ ] Create Garden tilemap in Tiled
- [ ] Implement flower placement system (1 article = 1 flower, grouped by tag)
- [ ] Implement proximity-based article preview (right-side HTML panel)
- [ ] Implement article full-read overlay panel
- [ ] Add Signpost interaction → recent articles list
- [ ] Implement scene transition (Bedroom → Garden → Bedroom) with fade effect
- [ ] Deploy and test with real articles

**Deliverable**: A working blog garden. Writing a new article = dropping a file = new flower appears.

---

### Phase 3 — Projects & Polish
**Goal**: Projects page and refined interactions.

- [ ] Set up `content/projects/` with sample projects
- [ ] Build Projects overlay panel (computer desk interaction)
- [ ] Tag filtering on projects panel
- [ ] Polish all dialogue content
- [ ] Refine pixel art (replace placeholder assets with final sprites/tiles)
- [ ] Implement walk animation for all 4 directions
- [ ] Add ambient audio with mute toggle
- [ ] Accessibility pass (keyboard-full navigation, reduced motion option)
- [ ] Custom domain setup on Cloudflare Pages

**Deliverable**: Full site — bedroom, garden, projects. Ready to share publicly.

---

### Phase 4 — Character & World Expansion (Future)
**Goal**: Make it feel truly personal and alive.

- [ ] Commission or craft a fully custom Hannah persona sprite
- [ ] Add seasonal garden variation (different flowers in different months)
- [ ] Add an "About Me" interaction (pinboard with links, photo, bio)
- [ ] Consider a third room / outdoor area (future expansion)
- [ ] Add animations to furniture objects (computer screen glow, cat blinking)
- [ ] Add weather effects to garden (parallax rain, sunshine particles)

---

## 13. Open Questions & Future Scope

### Decisions to Revisit

| Question | Options | Notes |
|---|---|---|
| Projects page: overlay vs full scene? | Overlay panel (simpler) / Separate Phaser scene | Overlay is faster to build; scene gives more creative space |
| Flower variety: tag-driven or slug-seeded random? | Deterministic by tag / Random seeded | Tag-driven gives intentionality; random gives variety |
| Click-to-walk pathfinding: Phaser built-in or plugin? | `PathFollower` + `NavMesh` plugin / Simple A* | NavMesh plugin recommended; evaluate Phaser 3 PathfindingPlugin |
| Character art: off-the-shelf recolour or custom? | Recolour existing / Commission / DIY in LibreSprite | Recolour is fastest for Phase 1; custom for Phase 3+ |
| Mobile support? | Desktop-only / Responsive with touch controls | Touch controls are achievable but add scope; defer to Phase 3 |
| Dark mode / light mode? | Fixed palette / Togglable | Pixel art palettes are fixed by design; probably skip |

### Stretch Ideas

- **Cat as a navigation hint** — the cat walks around and occasionally leads the player to a hidden Easter egg.
- **Time-of-day palette shifts** — bedroom is warmer in the morning, cooler at night (based on system time).
- **Guestbook** — a notebook in the bedroom visitors can "sign" (requires a backend or a service like Giscus/Utterances).
- **Achievements/badges** — hidden interactions unlock small collectibles shown in a journal.
- **RSS feed** — auto-generated from the articles markdown pipeline.
- **OG image generation** — each article auto-generates a pixel-art open graph image on deploy.

---

*End of SRD v1.0 — zerosicx*

> "A room of one's own, rendered in sixteen pixels." ✨
