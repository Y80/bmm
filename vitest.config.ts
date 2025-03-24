/// <reference types="vitest" />

import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import { declareLocalType, loadEnv } from './scripts/utils'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  await loadEnv()
  await declareLocalType()

  return {
    plugins: [tsconfigPaths()],
  }
})
