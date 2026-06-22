import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this project site under /<repo>/. Use that as the base
// for production builds; keep "/" for local dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/-another-trick-/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
}));
