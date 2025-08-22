import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from network
    port: 5173,
    allowedHosts: [
      'include-rack-looksmart-convicted.trycloudflare.com',
      "*" // add your Cloudflare URL
    ],
  },

})
