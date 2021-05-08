import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // 部署之后首页为：www.foo.com/nav/index.html
  base: '/nav/',
  build: {
    outDir: 'nav',
  },
})
