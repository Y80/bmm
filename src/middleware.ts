// https://nextjs.org/docs/app/building-your-application/routing/middleware
// https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware

import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from './lib/auth/config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // const method = req.method
  const pathname = req.nextUrl.pathname
  if (pathname === '/favicon.ico') {
    return NextResponse.rewrite(req.nextUrl.origin + '/logo.svg')
  }
  // 默认为 true，仅对于少数请求免除验证
  let checkAdmin = true
  const prefixes = ['/_next', '/api/auth', '/tag']
  const affixes = ['.svg', '.png']
  if (
    affixes.some((p) => pathname.endsWith(p)) ||
    prefixes.some((p) => pathname.startsWith(p)) ||
    ['/', '/recent', '/search', '/login', '/forbidden'].includes(pathname)
  ) {
    checkAdmin = false
  }
  if (checkAdmin) {
    if (!req.auth?.user) {
      return NextResponse.redirect(req.nextUrl.origin + '/login')
      // return NextResponse.json({ msg: '请登录' }, { status: StatusCode.UNAUTHORIZED })
    }
    if (!req.auth.user.isAdmin) {
      return NextResponse.redirect(req.nextUrl.origin + '/forbidden')
    }
  }
  return NextResponse.next()
})
