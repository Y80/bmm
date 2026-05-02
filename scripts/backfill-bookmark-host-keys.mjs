#!/usr/bin/env zx

import 'zx/globals'
import { eq, isNull } from 'drizzle-orm'
import { checkEnvs, declareLocalType, exitWithDbClose, loadEnv, testDbConnect } from './utils.mjs'

async function backfillBookmarkTable(db, table, label, getBookmarkHostKey) {
  const rows = await db
    .select({ id: table.id, url: table.url })
    .from(table)
    .where(isNull(table.hostKey))

  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const hostKey = getBookmarkHostKey(row.url)
    if (!hostKey) {
      skipped += 1
      continue
    }

    await db.update(table).set({ hostKey }).where(eq(table.id, row.id))
    updated += 1
  }

  echo(`${label}: 已回填 ${updated} 条，跳过 ${skipped} 条`)
  return { updated, skipped }
}

async function main() {
  await loadEnv()
  checkEnvs()
  await declareLocalType()

  await spinner('数据库连接中...', async () => {
    if (!(await testDbConnect())) {
      echo(chalk.red('❌ 数据库连接失败'))
      process.exit(1)
    }
  })

  const [{ db, schema }, { getBookmarkHostKey }] = await Promise.all([
    import('@/db'),
    import('@/controllers/BookmarkHostCheck.controller'),
  ])

  const publicResult = await backfillBookmarkTable(
    db,
    schema.publicBookmarks,
    '公共书签',
    getBookmarkHostKey
  )
  const userResult = await backfillBookmarkTable(
    db,
    schema.userBookmarks,
    '用户书签',
    getBookmarkHostKey
  )

  echo(
    chalk.green(
      `✅ HostKey 回填完成，共更新 ${publicResult.updated + userResult.updated} 条，跳过 ${
        publicResult.skipped + userResult.skipped
      } 条`
    )
  )
  await exitWithDbClose()
}

main()
