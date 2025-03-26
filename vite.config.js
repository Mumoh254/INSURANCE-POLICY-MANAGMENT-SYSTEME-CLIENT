import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, 
      deleteOriginFile: false, 
    })
  ],
  optimizeDeps: {
    include: ['@chakra-ui/react']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
});
