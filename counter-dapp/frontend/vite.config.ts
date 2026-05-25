import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['@polkadot/util', '@polkadot/util-crypto', '@polkadot/wasm-util'],
    alias: {
      buffer: 'buffer/',
      assert: 'assert/',
      process: 'process/browser',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
});
