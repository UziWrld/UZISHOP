import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@features': path.resolve(__dirname, './src/features'),
      '@api': path.resolve(__dirname, './src/core/api'),
      '@utils': path.resolve(__dirname, './src/core/utils'),
      '@components': path.resolve(__dirname, './src/core/components'),
      '@assets': path.resolve(__dirname, './src/core/assets'),
      '@auth': path.resolve(__dirname, './src/features/auth'),
      '@products': path.resolve(__dirname, './src/features/products'),
      '@cart': path.resolve(__dirname, './src/features/cart'),
      '@checkout': path.resolve(__dirname, './src/features/checkout'),
      '@admin': path.resolve(__dirname, './src/features/admin'),
      // @productServices: alias específico de features/products para uso interno del feature
      '@productServices': path.resolve(__dirname, './src/features/products/services'),
      '@pages': path.resolve(__dirname, './src/pages'),
    }
  },
  server: {
    host: true,
    port: 5173
  }
});
