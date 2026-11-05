import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Le site est construit dans le dossier parent (site-2/), que GitHub Pages publie.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: { outDir: '..', emptyOutDir: false },
});
