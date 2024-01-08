import { resolve } from 'path';
import { defineConfig } from 'vite';
import getViteConfig from './config';

// https://vitejs.dev/config/
export default defineConfig(getViteConfig({
    content: resolve(__dirname, './src/content.tsx'),
}, false));
