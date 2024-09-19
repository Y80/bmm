// import { loadEnvConfig } from '@next/env'
// import { sql } from 'drizzle-orm'
// import PublicTags from './publictag.json'

// loadEnvConfig(process.cwd(), true)

// async function main() {
//   const { db, publicTags } = await import('@/db')

//   const preparedList = PublicTags.publicTags.map((tag) => {
//     return db
//       .insert(publicTags)
//       .values({
//         id: Number(tag.id),
//         name: tag.name,
//         color: tag.color,
//         isMain: !!tag.isMain,
//         icon: tag.icon,
//       })
//       .onConflictDoNothing()
//       .prepare('')
//   })

//   await Promise.all(preparedList.map((item) => item.execute()))

//   // 调整 id 序列
//   await db.execute(
//     sql`SELECT setval('public."publicTags_id_seq"', (SELECT MAX(id) from "publicTags") + 1);`
//   )
//   const res = await db.execute(sql`SELECT nextval('public."publicTags_id_seq"');`)
//   console.log(res)

//   console.log('✅ 导入成功')

//   process.exit()
// }

// main()
