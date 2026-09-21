import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const pages = [
  'index', 'products', 'product', 'offers', 'brands', 'services', 'contact',
  'admin/login', 'admin/dashboard', 'admin/products', 'admin/stock', 'admin/reports',
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
