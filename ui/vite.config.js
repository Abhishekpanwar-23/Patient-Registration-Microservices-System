import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/register': 'http://registration-service:8080',
      '/patients': {
        target: 'http://processing-service:9090',
        changeOrigin: true,
        secure: false
      },
      '/search': 'http://search-service:8081'
    }
  }
})


