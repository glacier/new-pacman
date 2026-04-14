/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/new-pacman/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
