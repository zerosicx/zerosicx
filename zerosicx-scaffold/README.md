# zerosicx

A pixel-art, game-like personal website inspired by Pokémon and Stardew Valley.

Navigate a top-down bedroom and garden with arrow keys. Interact with objects, read blog posts, and find the cat.

## Tech Stack

- [Phaser 3](https://phaser.io/) — game engine
- [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/) — build & language
- [Tailwind CSS v4](https://tailwindcss.com/) — HTML overlay styling
- [Tiled Map Editor](https://www.mapeditor.org/) — tilemap authoring (Phase 2)
- `gray-matter` + `marked` — markdown content pipeline

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Adding Content

**New blog post** → drop a file in `content/articles/`:
```
content/articles/YYYY-MM-DD-your-title.md
```

**New project** → drop a file in `content/projects/`:
```
content/projects/your-project.md
```

Each new article automatically creates a flower in the garden 🌸

See `docs/zerosicx-SRD.md` for the full specification and content schema.

## Deployment

Pushes to `main` auto-deploy to Netlify via GitHub Actions.

Required secrets in GitHub → Settings → Secrets:
- `NETLIFY_AUTH_TOKEN` — from Netlify → User Settings → Personal Access Tokens
- `NETLIFY_SITE_ID` — from Netlify → Site → Site Configuration → Site ID
