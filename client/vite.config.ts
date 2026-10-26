import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const API_URL = process.env.API_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    // In development the Express API runs separately; proxy its routes.
    proxy: Object.fromEntries(
      ['/api', '/docs', '/openapi.json', '/health'].map((path) => [path, API_URL]),
    ),
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
