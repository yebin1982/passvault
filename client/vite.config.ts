import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Use the asm.js version of argon2-browser to avoid wasm loading issues with Vite
      'argon2-browser': 'argon2-browser/dist/argon2.asm.js',
    },
  },
});