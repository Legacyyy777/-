import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: true,
        port: 3000,
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'esbuild', // Быстрее чем terser
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: {
                    // Простое разделение на чанки
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'animation-vendor': ['framer-motion'],
                },
            },
        },
    },
});

