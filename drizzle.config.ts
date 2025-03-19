import { defineConfig } from 'drizzle-kit'

if (!process.env.DB_CONNECTION_URL) {
  throw new Error('请配置数据库连接')
}

/**
 * drizzle orm 配置
 * @link https://orm.drizzle.team/docs/drizzle-config-file
 */
export default defineConfig(
  (() => {
    const dbDriver = process.env.DB_DRIVER
    const folderAlias: Record<typeof dbDriver, string> = {
      postgresql: 'postgres',
      sqlite: 'sqlite',
      // mysql: 'mysql',
    }
    const folder = folderAlias[dbDriver]
    // 指定 Schema 文件或文件夹路径
    const schema = `./src/db/${folder}/schemas/*`
    // 执行数据库迁移时，将会在这个目录中生成一些迁移 SQL 和其他记录数据的文件
    const out = `./src/db/${folder}/migrations/${process.env.NODE_ENV}`
    if (dbDriver === 'postgresql') {
      return {
        schema,
        out,
        dialect: 'postgresql',
        dbCredentials: { url: process.env.DB_CONNECTION_URL },
      }
    }
    if (process.env.DB_CONNECTION_URL.startsWith('libsql://')) {
      return {
        schema,
        out,
        dialect: 'turso',
        dbCredentials: {
          url: process.env.DB_CONNECTION_URL,
          authToken: process.env.DB_AUTH_TOKEN,
        },
      }
    }
    return {
      schema,
      out,
      dialect: 'sqlite',
      dbCredentials: { url: process.env.DB_CONNECTION_URL },
    }
  })()
)
