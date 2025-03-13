import { LibsqlError } from '@libsql/client'
import postgres from 'postgres'

export default class SqlXError extends Error {
  name = 'SqlXError'
  originErrorName: string
  // table?: string
  // column?: string

  originalError?: Error

  constructor(err: Error) {
    super()
    this.originalError = err
    this.originErrorName = err.name
  }

  get message() {
    if (this.originalError?.name === postgres.PostgresError.name) {
      const error = this.originalError as postgres.PostgresError
      // 违反唯一值限制
      if (error.code === '23505') {
        if (/publicTags_name_unique/i.test(error.message)) {
          return '已存在相同名称的标签'
        }
        if (error.message.includes('publicBookmarks_name_unique')) {
          return '已存在相同名称的书签'
        }
        if (error.message.includes('publicBookmarks_url_unique')) {
          return '已存在相同网址的书签'
        }
      }
    }

    if ((this.originalError as any)?.libsqlError) {
      const error = this.originalError as LibsqlError
      if (error.rawCode === 2067) {
        if (error.message.includes('publicTags.name')) {
          return '已存在相同名称的标签'
        }
        if (error.message.includes('publicBookmarks.name')) {
          return '已存在相同名称的书签'
        }
        if (error.message.includes('publicBookmarks.url')) {
          return '已存在相同网址的书签'
        }
      }
    }

    // 返回未知错误说明有些异常没有考虑到，务必及时补充！
    return '未知错误'
  }

  static getMessage(err: any) {
    return new SqlXError(err).message
  }

  static canParse(err: any) {
    return err?.name === postgres.PostgresError.name || err?.libsqlError
  }
}
