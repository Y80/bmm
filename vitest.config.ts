/// <reference types="vitest" />

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { loadEnv } from './scripts/utils'

loadEnv()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
})
