import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.test.{js,jsx}'],
    },
    resolve: {
        alias: {
            '@core': path.resolve(__dirname, './src/core'),
            '@features': path.resolve(__dirname, './src/features'),
            '@auth': path.resolve(__dirname, './src/features/auth'),
            '@cart': path.resolve(__dirname, './src/features/cart'),
            '@products': path.resolve(__dirname, './src/features/products'),
            '@checkout': path.resolve(__dirname, './src/features/checkout'),
            '@admin': path.resolve(__dirname, './src/features/admin'),
            '@components': path.resolve(__dirname, './src/core/components'),
            '@api': path.resolve(__dirname, './src/core/api'),
            '@services': path.resolve(__dirname, './src/core/services'),
            '@utils': path.resolve(__dirname, './src/core/utils'),
            '@hooks': path.resolve(__dirname, './src/core/hooks'),
            '@models': path.resolve(__dirname, './src/core/models'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@assets': path.resolve(__dirname, './src/core/assets'),
        },
    },
});
