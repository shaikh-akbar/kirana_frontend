import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The API is proxied rather than called cross-origin so the browser never
    // issues a preflight and the backend's CORS_ORIGIN cannot drift out of sync
    // with whatever port Vite happens to pick. Override the target with
    // VITE_API_PROXY_TARGET when the backend runs elsewhere.
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
