import { isServerless } from '@/utils'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../schemas'

if (!process.env.DB_CONNECTION_URL) {
  throw new Error(
    `环境变量 DB_CONNECTION_URL 缺失，请检查。
Tip: 如果手动注入了环境变量，确保手动注入环境变量操作完成后再加载当前模块，如使用 await import() 延迟加载
`
  )
}

// 避免 Next.js 热更新导致的重复创建连接
const g = global as typeof globalThis & { _pgSql: postgres.Sql }

function createOpts(): postgres.Options<any> {
  if (isServerless()) {
    console.log('当前处于 Serverless 环境')
    return {
      max: 8,
      idle_timeout: 10,
      max_lifetime: 10,
    }
  }
  return { idle_timeout: 60 * 5 }
}

if (!g._pgSql) {
  g._pgSql = postgres(process.env.DB_CONNECTION_URL, createOpts())
}

export const db = drizzle(g._pgSql, { schema })

export const pgSql = g._pgSql
