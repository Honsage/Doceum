import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    strictPort: true,
  },
  
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './src/assets'),
    }
  },
  
  optimizeDeps: {
    exclude: ['doceum-wasm']
  }
})