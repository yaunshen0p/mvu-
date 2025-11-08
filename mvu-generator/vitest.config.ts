import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    root: path.resolve(__dirname, '..'),
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
});
