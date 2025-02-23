#!/usr/bin/env zx

import 'zx/globals'
import { dbExecute, exitWithDbClose, loadEnv, testDbConnect } from './utils'

async function main() {
  const prefix = chalk.bold.cyan('[INIT-DATABASE]: ')
  echo(prefix + '开始执行数据库初始化脚本')

  await loadEnv()

  if (!(await testDbConnect())) {
    echo(chalk.red('❌ 数据库连接失败'))
    process.exit(1)
  }

  echo(chalk.green('✅ 数据库连接成功'))

  // 数据库是否已经初始化（通过检测表 publicBookmarks 是否存在）
  async function testDBInitialed() {
    const { db } = await import('@/db')
    let sql = ''
    if (process.env.DB_DRIVER === 'postgresql') {
      sql = `
        SELECT *
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public' AND tablename = 'publicBookmarks';`
      const res = await dbExecute(sql)
      return res.length === 1
    } else if (process.env.DB_DRIVER === 'sqlite') {
      sql = `
      SELECT name 
      FROM sqlite_master 
      WHERE type = 'table' 
      AND name = 'publicBookmarks';`
      const res = await dbExecute(sql)
      return res.rows.length === 1
    }
  }

  try {
    const dbInitialed = await testDBInitialed()
    if (dbInitialed) {
      echo(prefix + '已经初始化，跳过本次任务\n')
    } else {
      echo(prefix + '开始数据库初始化')
      await $`pnpm drizzle-kit generate`
      echo(prefix + chalk.green('✅ 已生成本地快照'))
      await $`pnpm drizzle-kit migrate`
      echo(prefix + chalk.green('✅ 数据库初始化成功'))
      echo(prefix + '💡 建议通过 git 提交生成的快照，以便后续数据库迁移\n')
    }
    exitWithDbClose()
  } catch (err) {
    console.log('\n\n\n========================================================================')
    echo(chalk.red(prefix + '数据库初始化失败'))
    console.error(err)
    console.log('========================================================================')
    echo(
      chalk.yellow(
        '数据库初始化失败，请重试。或前往：\n' +
          'https://github.com/Y80/bmm/issues?q=is%3Aissue%20%20%E6%95%B0%E6%8D%AE%E5%BA%93%20' +
          '查看类似的问题，或带上报错信息新建 issue，我会尽快处理 :) \n'
      )
    )
    exitWithDbClose(1)
  }
}

main()
