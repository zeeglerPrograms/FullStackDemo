import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: '0.0.0.0',
    allowedHosts: "fullstackdemo-0jdr.onrender.com"
  },
})
