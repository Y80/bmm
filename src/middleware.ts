// https://nextjs.org/docs/app/building-your-application/routing/middleware
// https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware

import { ApiRoutes } from '@cfg'
import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './lib/auth/config'
import { Method, StatusCode } from './lib/http'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const method = req.method as any
  const pathname = req.nextUrl.pathname as any
  let checkAdmin = false
  if (
    [ApiRoutes.Public.TAG, ApiRoutes.Public.BOOKMARK].includes(pathname) &&
    [Method.POST, Method.PATCH, Method.DELETE].includes(method)
  ) {
    checkAdmin = true
  } else if (
    [ApiRoutes.Ai.ANALYZE_WEBSITE, ApiRoutes.Ai.ANALYZE_RELATED_TAGS].includes(pathname) &&
    Method.POST === method
  ) {
    checkAdmin = true
  }
  if (checkAdmin) {
    if (!req.auth?.user) {
      return NextResponse.json({ msg: '请登录' }, { status: StatusCode.UNAUTHORIZED })
    }
    if (!req.auth.user.isAdmin) {
      return NextResponse.json({ msg: '暂无权限' }, { status: StatusCode.FORBIDDEN })
    }
  }
  return NextResponse.next()
})
