/// <reference types="vitest" />

// import react from '@vitejs/plugin-react'
import NextEnv from '@next/env'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

NextEnv.loadEnvConfig(process.cwd())

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // environment: 'jsdom',
  },
})
