import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024, // Compress files larger than 1KB
      deleteOriginFile: false, // Keep original files alongside compressed ones
    })
  ],
  optimizeDeps: {
    include: ['@chakra-ui/react']
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  }
});
