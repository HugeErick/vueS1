import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import {fileURLToPath} from 'node:url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue()],
  resolve: {
			 alias: [
            { find: '@', replacement: path.resolve('./src/@/') },
            { find: '@/components', replacement: path.resolve('./src/@/components/') 
        },
            { find: '@/lib', replacement: path.resolve('./src/@/lib/') },
        ],
     },
})
