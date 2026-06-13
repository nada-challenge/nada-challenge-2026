import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nada-challenge-2026/',
  build: {
    rollupOptions: {
      input: {
        main:     'index.html',
        about:    'about.html',
        parade:   'parade.html',
        spot:     'spot.html',
        access:   'access.html',
        donation: 'donation.html',
        404:      '404.html',
      }
    }
  }
})
