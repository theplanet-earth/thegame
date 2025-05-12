import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',  // Root directory, this is where index.html is located
  build: {
    outDir: 'dist',  // Output directory for the build
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),  // Entry point for the build
    },
  },
  server: {
    host: '0.0.0.0',  // Allows external access for testing
    port: 8026,  // Port to run the dev server
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),  // Alias for easier imports
    },
  },
});
