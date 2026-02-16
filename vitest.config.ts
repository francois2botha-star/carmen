import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules', 'dist'],
    environment: 'jsdom',
    globals: true,
    threads: false
  }
});
