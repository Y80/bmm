#!/usr/bin/env zx

import 'zx/globals'
import { checkEnvs, declareLocalType, exitWithDbClose, loadEnv, testDbConnect } from './utils.mjs'

function parseArgs() {
  const args = minimist(process.argv.slice(2), {
    alias: {
      email: 'e',
      password: 'p',
    },
    string: ['email', 'password'],
  })

  const email = args.email || args._[0]
  const password = args.password || args._[1]

  if (!email || !password) {
    echo(chalk.yellow('用法：pnpm user:reset-password -- --email user@example.com --password NewPass123'))
    echo(chalk.yellow('或：pnpm user:reset-password -- user@example.com NewPass123'))
    process.exit(1)
  }

  return { email, password }
}

async function main() {
  await loadEnv()
  checkEnvs()
  await declareLocalType()

  const { email, password } = parseArgs()

  echo(chalk.cyan('当前环境：'), process.env.NODE_ENV)
  echo(chalk.cyan('数据库驱动：'), process.env.DB_DRIVER)
  echo(chalk.cyan('目标账号：'), email)

  if (!(await testDbConnect())) {
    echo(chalk.red('❌ 数据库连接失败，请检查'))
    process.exit(1)
  }

  const { default: CredentialsController } = await import('@/controllers/Credentials.controller')
  await CredentialsController.resetPassword({ email, password })

  echo(chalk.green('✅ 密码重设成功'))
  await exitWithDbClose()
}

main().catch(async (error) => {
  echo(chalk.red('❌ 密码重设失败'))
  console.error(error)
  await exitWithDbClose(1)
})
