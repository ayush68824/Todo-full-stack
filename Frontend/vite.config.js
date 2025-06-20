import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@mui/x-date-pickers'],
          emotion: ['@emotion/react', '@emotion/styled'],
          utils: ['axios', 'date-fns', 'react-toastify']
        },
      },
      maxParallelFileOps: 20,
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
  },
<<<<<<< HEAD:Frontend/vite.config.js
}) 
=======
})
>>>>>>> d1d30f5f73897894f9d369f1f4c8bb8a3c1c96b9:Frontend/vite.config.ts
