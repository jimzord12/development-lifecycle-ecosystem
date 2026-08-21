import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'release' ? [viteSingleFile()] : [])],
  publicDir: false,
  base: './',
  build: {
    outDir: mode === 'release' ? 'dist-release' : 'dist',
    emptyOutDir: true,
    sourcemap: false,
    target: 'baseline-widely-available',
  },
}));
