#!/usr/bin/env zx

import 'zx/globals'
import { exitWithDbClose, loadEnv, redactDbConnectionUrl, testDbConnect } from './utils.mjs'

async function main() {
  await loadEnv()
  let exitCode = 0

  echo(chalk.cyan('当前环境：'), process.env.NODE_ENV)
  echo(chalk.cyan('数据库驱动：'), process.env.DB_DRIVER)
  echo(chalk.cyan('数据库链接：'), redactDbConnectionUrl(process.env.DB_CONNECTION_URL))

  await spinner('数据库连接中', async () => {
    if (await testDbConnect()) {
      echo(chalk.green('✅ 数据库连接成功'))
    } else {
      exitCode = 1
      echo(chalk.red('❌ 数据库连接失败，请检查'))
    }
    await exitWithDbClose(exitCode)
  })
}

main()
