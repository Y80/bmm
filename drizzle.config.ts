// https://orm.drizzle.team/kit-docs/config-reference

import { defineConfig } from 'drizzle-kit'

// loadEnvConfig(process.cwd(), true)

if (!process.env.DB_CONNECTION_URL) {
  throw new Error('请配置数据库连接')
}

export default defineConfig(
  (() => {
    return {
      // 指定 Schema 文件或文件夹路径
      schema: './src/db/postgres/schemas/*',
      // 执行数据库迁移时，将会在这个目录中生成一些迁移 SQL 和其他记录数据的文件
      out: './src/db/postgres/migrations/' + process.env.NODE_ENV,

      // For 「SQLite + Turso」
      // dialect: 'sqlite',
      // driver: 'turso',
      // dbCredentials: {
      //   url: process.env.TURSO_DATABASE_URL!,
      //   authToken: process.env.TURSO_AUTH_TOKEN,
      // },

      // For 「SQLite + better-sqlite3」
      // dialect: 'sqlite',
      // dbCredentials: { url: LOCAL_SQLITE_DB },

      // For 「MySQL + mysql2」
      // dialect: 'mysql',
      // dbCredentials: { url: process.env.DB_CONNECTION_URL },

      // For 「Postgres」
      dialect: 'postgresql',
      dbCredentials: { url: process.env.DB_CONNECTION_URL },
    }
  })()
)
