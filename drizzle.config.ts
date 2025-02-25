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
    // 根据你的配置使用相应的断言
    const dbDriver = process.env.DB_DRIVER as 'sqlite'
    // const dbDriver = process.env.DB_DRIVER as 'sqlite'

    const folderAlias: Record<typeof process.env.DB_DRIVER, string> = {
      postgresql: 'postgres',
      // mysql: 'mysql',
      sqlite: 'sqlite',
    }
    return {
      // 指定 Schema 文件或文件夹路径
      schema: `./src/db/${folderAlias[dbDriver]}/schemas/*`,
      // 执行数据库迁移时，将会在这个目录中生成一些迁移 SQL 和其他记录数据的文件
      out: `./src/db/${folderAlias[dbDriver]}/migrations/` + process.env.NODE_ENV,

      dialect: dbDriver,
      dbCredentials: { url: process.env.DB_CONNECTION_URL },
    }
  })()
)
