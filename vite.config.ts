import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from network
    port: 5173,
    allowedHosts: [
      "https://cautious-dollop-rwwq5vgpxx6369g-8080.app.github.dev",
      "cautious-dollop-rwwq5vgpxx6369g-8080.app.github.dev",
      'growing-bugs-thunder-spoken.trycloudflare.com',
      "*" // add your Cloudflare URL
    ],
  },
})
