import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = [
  'index', 'about', 'products', 'product', 'offers', 'brands', 'services', 'contact',
  'admin/index', 'admin/login',
];

export default defineConfig({
  css: { preprocessorOptions: { scss: { api: 'modern-compiler' } } },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((p) => [p.replace('/', '-'), resolve(import.meta.dirname, `${p}.html`)]),
      ),
    },
  },
});
