import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development, /api is forwarded to the Spring Boot backend,
// so the frontend can call '/api/...' without CORS or a hardcoded host.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
