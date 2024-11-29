#!/usr/bin/env zx

import 'zx/globals'
import { exitWithCloseDb, loadEnv, testDbConnect } from './utils'

async function main() {
  await loadEnv()

  await spinner('数据库连接中...', async () => {
    if (!(await testDbConnect())) {
      echo(chalk.red('❌ 数据库连接失败'))
      process.exit(1)
    }
  })

  let finalChunk = ''
  for await (const chunk of $`pnpm drizzle-kit generate`.stdout) {
    echo(chunk)
    finalChunk = chunk
  }
  if (finalChunk.toString().includes('nothing to migrate')) {
    echo(chalk.yellow('没有检测到 Schema 变更，无需数据库迁移'))
  } else {
    echo(chalk.green('✅ 已生成本地快照'))
    for await (const chunk of $`pnpm drizzle-kit migrate`.stdout) {
      echo(chunk)
    }
    echo(chalk.green('✅ 数据库迁移成功'))
    !process.env.VERCEL && echo('\n💡 建议通过 git 提交生成的快照，以便后续数据库迁移\n')
  }
  exitWithCloseDb()
}

main()
