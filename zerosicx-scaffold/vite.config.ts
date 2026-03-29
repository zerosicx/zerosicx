import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    open: true,
  },
  build: {
    assetsInlineLimit: 0, // keep all assets as separate files (important for tilemaps/spritesheets)
  },
});
