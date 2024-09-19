import { Assets, PageRoutes } from '@cfg'
import { NextAuthConfig } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

const githubProvider = GithubProvider({
  // profile(profile) {
  //   return {
  //     id: profile.id.toString(),
  //     ...
  //   }
  // },
})

// 运行在 Vercel 平台上，不使用代理
if (!process.env.VERCEL) {
  // 有代理优先使用代理
  githubProvider.token = process.env.FETCH_GITHUB_TOKEN_PROXY || githubProvider.token
}

// 这里没有配置 adapter，是为了兼容边缘环境
// https://authjs.dev/guides/edge-compatibility
export const authConfig = {
  providers: [githubProvider],
  session: { strategy: 'jwt' },
  pages: { signIn: PageRoutes.LOGIN },
  theme: { logo: Assets.LOGO_SVG },
  // debug: true,
  callbacks: {
    // authorized(params) {
    //   return NextResponse.json({ msg: '暂无权限' }, { status: 403 })
    // },
    jwt(params) {
      // console.log('[next-auth][callbacks.jwt]\n', params)
      if (params.user) {
        params.token.role = params.user.role
      }
      return params.token
    },
    // 控制返回的 Session 的数据
    // 这里的 params.token 是上面 jwt() 的返回
    session(params) {
      // console.log('[next-auth][callbacks.session]\n', params)
      const session = params.session
      if (session.user) {
        session.user.isAdmin = params.token.role === 'admin'
      }
      return params.session
    },
  },
} satisfies NextAuthConfig
