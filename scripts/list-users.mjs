#!/usr/bin/env zx

import 'zx/globals'
import { checkEnvs, declareLocalType, exitWithDbClose, loadEnv, testDbConnect } from './utils.mjs'

function formatDate(date) {
  if (!(date instanceof Date)) return '-'
  return date.toLocaleString('zh-CN', { hour12: false })
}

async function main() {
  await loadEnv()
  checkEnvs()
  await declareLocalType()

  if (!(await testDbConnect())) {
    echo(chalk.red('❌ 数据库连接失败，请检查'))
    process.exit(1)
  }

  const { default: UserController } = await import('@/controllers/User.controller')
  const users = await UserController.findAll()

  if (users.length === 0) {
    echo(chalk.yellow('当前数据库中暂无用户'))
    await exitWithDbClose()
  }

  console.table(
    users.map((user,) => ({
      Email: user.email,
      Role: user.role || 'user',
      CreatedAt: formatDate(user.createdAt),
    }))
  )

  await exitWithDbClose()
}

main().catch(async (error) => {
  echo(chalk.red('❌ 获取用户列表失败'))
  console.error(error)
  await exitWithDbClose(1)
})
