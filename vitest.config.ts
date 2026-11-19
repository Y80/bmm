/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import { declareLocalType, loadEnv } from './scripts/utils.mjs'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  await loadEnv()
  await declareLocalType()

  return {
    resolve: { tsconfigPaths: true },
    test: {
      fileParallelism: false,
      maxWorkers: 1,
    },
  }
})
