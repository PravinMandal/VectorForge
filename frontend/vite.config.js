import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/search': 'http://localhost:8080',
      '/items': 'http://localhost:8080',
      '/benchmark': 'http://localhost:8080',
      '/hnsw-info': 'http://localhost:8080',
      '/insert': 'http://localhost:8080',
      '/delete': 'http://localhost:8080',
      '/status': 'http://localhost:8080',
      '/doc': 'http://localhost:8080',
      '/stats': 'http://localhost:8080'
    }
  }
})
