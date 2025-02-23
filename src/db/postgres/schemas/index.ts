export * from './auth'
export * from './public'

if (process.env.DB_DRIVER !== 'postgresql') {
  throw new Error(
    '环境变量 DB_DRIVER 配置错误：当前尝试加载 db/postgres/schemas，但配置的数据库驱动不是 "postgresql" 而是：' +
      process.env.DB_DRIVER
  )
}
