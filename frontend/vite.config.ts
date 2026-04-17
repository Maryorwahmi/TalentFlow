import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/app': path.resolve(__dirname, './src/app'),
      '@/modules': path.resolve(__dirname, './src/modules'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
    open: false,
    allowedHosts: ['wrinkle-sculpture-greedless.ngrok-free.dev', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
})
