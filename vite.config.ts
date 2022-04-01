import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'fs'

// 根据 tsconfig.json 中的 paths 生成 alias
const tsConfig = fs
  .readFileSync('./tsconfig.json')
  .toString()
  // 去除 JSON 中的注释，否则 JSON.parse 将会失败
  .replace(/\/\/.+/g, '')
const {
  compilerOptions: { paths },
} = JSON.parse(tsConfig)
// 格式：{ '@style': '/src/style' }
const alias = {}
Object.keys(paths).forEach((key) => {
  alias[key.replace(/\*$/, '')] = paths[key].pop().replace(/[\.\*$]/g, '')
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx
    vueJsx(),
  ],
  base: '/bmm/',
  resolve: {
    alias,
  },
  server: { port: 6888 },
})
