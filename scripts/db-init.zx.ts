#!/usr/bin/env zx

import 'zx/globals'
import { dbExecute, exitWithDbClose, loadEnv, testDbConnect } from './utils'

// 根据环境变量 process.env.DB_DRIVER 声明 type DB_DRIVER
async function declareLocalType() {
  if (!process.env.DB_DRIVER) throw new Error('环境变量 DB_DRIVER 未定义')
  const targetPath = path.resolve('local.d.ts')
  const fileContent = `
declare global {
  type DB_DRIVER ='${process.env.DB_DRIVER}'
}
export {}
`.trim()
  try {
    // 仅当内容变化时才写入
    const existingContent = await fs.readFile(targetPath, 'utf8').catch(() => '')
    if (existingContent.trim() === fileContent) return
    await fs.writeFile(targetPath, fileContent, { encoding: 'utf-8' })
    console.log(`Type declaration updated at ${targetPath}`)
  } catch (error) {
    console.error('Failed to generate type declaration:', error)
    process.exit(1)
  }
}

// 数据库是否已经初始化（通过检测表 publicBookmarks 是否存在）
async function testDBInitialed() {
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

async function main() {
  await loadEnv()

  await declareLocalType()

  const prefix = chalk.bold.cyan('[INIT-DATABASE]: ')
  echo(prefix + '开始执行数据库初始化脚本')

  if (!(await testDbConnect())) {
    echo(chalk.red('❌ 数据库连接失败'))
    process.exit(1)
  }

  echo(chalk.green('✅ 数据库连接成功'))

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
        '数据库初始化失败，请重试。\n或前往：\n' +
          'https://github.com/Y80/bmm/issues?q=数据库' +
          '\n查看类似的问题，或带上报错信息新建 issue，我会尽快处理 :) \n'
      )
    )
    exitWithDbClose(1)
  }
}

main()
