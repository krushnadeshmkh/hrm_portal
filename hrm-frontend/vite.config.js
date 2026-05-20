
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.error', 'console.warn'],
      },
    },
    cssCodeSplit: true,
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'react-router';
          }
          if (id.includes('node_modules/lucide-react/')) {
            return 'lucide-icons';
          }
          if (id.includes('node_modules/axios/')) {
            return 'axios';
          }
          if (id.includes('node_modules/bootstrap/')) {
            return 'bootstrap';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: [],
  },
})