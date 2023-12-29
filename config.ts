import {UserConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default function getViteConfig(input: Record<string, string>, emptyOutDir = true): UserConfig {
    return {
        build: {
            rollupOptions: {
                input,
                output: {
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                    assetFileNames: '[name].[ext]',
                }
            },
            emptyOutDir
        },
        plugins: [react()],
        resolve: {
            alias: [{ find: '@', replacement: '/src' }],
        }
    };
}
