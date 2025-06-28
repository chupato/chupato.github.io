import { join } from 'node:path'

import tailwindcss from '@tailwindcss/vite'
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'


export default defineConfig({
  build: {
    sourcemap: true,
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
  root: join(import.meta.dirname, './web'),
  plugins: [
    preact({ jsxImportSource: 'preact' }),
    tailwindcss(),
  ],
})
