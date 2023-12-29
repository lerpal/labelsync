import { resolve } from 'path';
import { defineConfig } from 'vite';
import getViteConfig from './config';

// https://vitejs.dev/config/
export default defineConfig(getViteConfig({
    options: resolve(__dirname, 'options.html'),
}));
