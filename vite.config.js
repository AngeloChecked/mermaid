import { defineConfig } from 'vitest/config'
import jison from './.vite/jisonPlugin.js';

export default defineConfig({
  plugins: [ jison(), ],
  test: {
    globals: true,
    environment: 'jsdom'
  },
})
