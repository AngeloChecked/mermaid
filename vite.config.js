import { defineConfig } from 'vitest/config'
import jison from './.vite/jisonPlugin.js';

export default defineConfig({
  base: '',
  plugins: [ jison(), ],
  test: {
    globals: true,
    environment: 'jsdom'
  },
})
