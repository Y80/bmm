#!/usr/bin/env zx

import 'zx/globals'
import { loadEnv, testDbConnect } from './utils'

async function main() {
  const prefix = chalk.bold.cyan('[INIT-DATABASE]: ')
  echo(prefix + '开始执行数据库初始化脚本')

  await loadEnv()

  if (!(await testDbConnect())) {
    echo(chalk.red('❌ 数据库连接失败'))
    process.exit(1)
  }

  const { pgSql } = await import('@/db/postgres/drivers/postgres')
  try {
    const res = await pgSql`
      SELECT * 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' AND tablename = 'publicBookmarks';`
    if (res.length === 1) {
      echo(prefix + '已经初始化，跳过本次任务\n')
    } else {
      echo('开始数据库初始化')
      await $`pnpm drizzle-kit generate`
      echo(prefix + chalk.green('✅ 已生成本地快照'))
      await $`pnpm drizzle-kit migrate`
      echo(prefix + chalk.green('✅ 数据库初始化成功'))
      echo(prefix + '💡 建议通过 git 提交生成的快照，以便后续数据库迁移\n')
    }
    await pgSql.end()
    process.exit(0)
  } catch (err) {
    console.error(err)
    echo(chalk.red(prefix + '数据库初始化失败'))
    process.exit(1)
  }
}

main()
