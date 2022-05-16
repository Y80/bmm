import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'fs'
import Unocss from 'unocss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // https://github.com/vitejs/vite/tree/main/packages/plugin-vue-jsx
    vueJsx(),
    Unocss(),
  ],
  // base: '/bmm/',
  resolve: {
    alias: { ...makeAlias() },
  },
  server: { port: 6888 },
})

/** 根据 tsconfig.json paths 生成适用于 vite.config 的 alias */
function makeAlias(tsconfigPath = './tsconfig.json') {
  const tsConfig = fs
    .readFileSync(tsconfigPath)
    .toString()
    // 去除 JSON 中的注释，否则 JSON.parse 将会失败
    .replace(/\/\/.+/g, '')
  const {
    compilerOptions: { paths: tsAlias },
  } = JSON.parse(tsConfig)
  // 格式：{ '@style': '/src/style' }
  const alias = {}
  Object.keys(tsAlias).forEach((key) => {
    alias[key.replace(/\*$/, '')] = tsAlias[key].pop().replace(/[\.\*$]/g, '')
  })

  return alias
}
