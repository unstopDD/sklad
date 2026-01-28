import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react({
        // Handle the "preamble" error in Vitest
        fastRefresh: process.env.NODE_ENV !== 'test'
    })],
    // Use /sklad/ for GitHub Pages, but / for local and Netlify
    base: process.env.GITHUB_ACTIONS || process.env.GH_PAGES ? '/sklad/' : '/',
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/test/setup.js',
    },
    css: {
        postcss: {
            plugins: [
                tailwindcss(),
                autoprefixer(),
            ],
        },
    },
})
