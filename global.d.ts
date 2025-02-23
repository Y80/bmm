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
}

declare module 'next-auth' {
  type Role = 'admin' | 'user' | undefined
  interface User {
    isAdmin?: boolean
    role?: Role
  }
}
