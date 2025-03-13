import type { SelectPublicBookmark, SelectPublicTag } from '@/controllers'
import type { schema } from '@/db'
import 'next-auth'

declare global {
  namespace NodeJS {
    // 只把编码时会实际调用的变量写过来即可，不用全写
    type OptionalVariables =
      | 'AUTO_GRANT_ADMIN'
      | 'AI_DEBUG'
      | 'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID'
      | 'NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID'
      | 'VERCEL' // 是否运行在 Vercel 平台中
    type RequiredVariables = 'DB_CONNECTION_URL'
    type ExtraVariables = Partial<Record<OptionalVariables, string>> &
      Record<RequiredVariables, string> & { DB_DRIVER: 'postgresql' | 'sqlite' } // 暂时只接入 postgresql 和 sqlite
    interface ProcessEnv extends ExtraVariables {}
  }

  /** 用户 ID 类型（UUID） */
  export type UserId = (typeof schema.users.$inferSelect)['id']
  /** 标签 ID 类型（userTags 和 publicTags 一致） */
  export type TagId = (typeof schema.publicTags.$inferSelect)['id']
  /** 书签 ID 类型（用户书签和公共书签） */
  export type BookmarkId = (typeof schema.publicBookmarks.$inferSelect)['id']
  /** publicTag / userTag 的公共类型 */
  export type SelectTag = SelectPublicTag
  /** publicBookmark / userBookmark 的公共类型 */
  export type SelectBookmark = SelectPublicBookmark
}

declare module 'next-auth' {
  type Role = 'admin' | 'user' | undefined
  interface User {
    isAdmin?: boolean
    role?: Role
  }
  interface Session {
    user: User
  }
}
