import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The plain-object form of defineConfig never reads .env — process.env here
  // only reflects real OS environment variables. loadEnv is what actually
  // pulls VITE_API_PROXY_TARGET out of .env for use in this config file.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // The API is proxied rather than called cross-origin so the browser never
      // issues a preflight and the backend's CORS_ORIGIN cannot drift out of sync
      // with whatever port Vite happens to pick. Override the target with
      // VITE_API_PROXY_TARGET when the backend runs elsewhere.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  }
})
