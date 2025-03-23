// https://nextjs.org/docs/app/building-your-application/routing/middleware
// https://authjs.dev/getting-started/session-management/protecting#nextjs-middleware
//
// 即使对于 Server Action（POST 请求，PATH 为调用 Server Action 的页面路径），也会触发该中间件
//
// ! 当前中间件已不再生效，所有身份验证通过 makeAction() 配置

import { PageRoutes } from '@cfg'
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
  // 是否检查管理员权限；默认为 true，仅对于少数请求免除验证
  let checkAdmin = true
  const whitelist = {
    prefixes: ['/_next', '/__next', '/api/auth', '/tag'],
    affixes: ['.svg', '.png'],
    pathnames: [
      '/',
      PageRoutes.Public.RANDOM,
      PageRoutes.Public.SEARCH,
      PageRoutes.LOGIN,
      PageRoutes.FORBIDDEN,
      '/404',
      '/500',
      '/_error',
    ],
  }
  if (
    whitelist.affixes.some((p) => pathname.endsWith(p)) ||
    whitelist.prefixes.some((p) => pathname.startsWith(p)) ||
    whitelist.pathnames.includes(pathname)
  ) {
    checkAdmin = false
  }
  if (checkAdmin) {
    // 没登录/登录过期，这里是 null
    if (!req.auth) {
      return NextResponse.redirect(req.nextUrl.origin + PageRoutes.LOGIN)
      // return NextResponse.json({ msg: '请登录' }, { status: StatusCode.UNAUTHORIZED })
    }
    if (!req.auth.user.isAdmin) {
      return NextResponse.redirect(req.nextUrl.origin + PageRoutes.FORBIDDEN)
    }
  }
  return NextResponse.next()
})
