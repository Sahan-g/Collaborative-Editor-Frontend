import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from network
    port: 5173,
    allowedHosts: [
      'mv-cornwall-navigate-fcc.trycloudflare.com',
      "*" // add your Cloudflare URL
    ],
  },

})
