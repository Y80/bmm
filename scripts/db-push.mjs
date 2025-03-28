#!/usr/bin/env zx

import 'zx/globals'
import { declareLocalType, exitWithDbClose, loadEnv, testDbConnect } from './utils.mjs'

async function main() {
  await loadEnv()
  await declareLocalType()

  await spinner('数据库连接中...', async () => {
    if (!(await testDbConnect())) {
      echo(chalk.red('❌ 数据库连接失败'))
      process.exit(1)
    }
  })

  await $`pnpm drizzle-kit push --strict --verbose`.pipe(process.stdout)
  return exitWithDbClose()
}

main()
