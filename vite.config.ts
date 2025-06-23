import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import { join } from 'node:path' // Deno uses node: prefix for Node.js compat

export default defineConfig({
  build: {
    sourcemap: true,
    outDir: join(import.meta.dirname, './dist'), // Output to root dist/
    emptyOutDir: true, // Clean outDir before build
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
  root: join(import.meta.dirname, './web'), // Set project root to web/
  plugins: [
    preact({ jsxImportSource: 'preact' }),
    // tailwindcss(), // Removed as PostCSS handles it
  ],
  server: {
    port: 3000, // Optional: specify dev server port
  },
})
