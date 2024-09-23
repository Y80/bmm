// https://nextjs.org/docs/app/building-your-application/routing/middleware
// https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware

import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './lib/auth/config'
import { Method, StatusCode } from './lib/http'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const method = req.method as any
  const pathname = req.nextUrl.pathname
  // 默认为 true，仅对于少数请求免除验证
  let checkAdmin = true
  if (method === Method.GET) {
    if (
      pathname.endsWith('.svg') ||
      pathname.endsWith('.png') ||
      pathname === '/' ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/recent') ||
      pathname.startsWith('/search')
    ) {
      checkAdmin = false
    }
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
