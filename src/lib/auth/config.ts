import { Assets, PageRoutes } from '@cfg'
import { NextAuthConfig } from 'next-auth'
import { credentialsProvider } from './credentials-provider'
import { githubProvider } from './github-provider'

// 这里没有配置 adapter，是为了兼容边缘环境
// https://authjs.dev/guides/edge-compatibility
export const authConfig = {
  // debug: true,
  providers: [githubProvider, credentialsProvider],
  // session 1 天内有效，超过 1 天会自动更新；超过 30 天内没有任何操作，就会过期，useSession() auth() 返回 null
  session: { strategy: 'jwt', maxAge: 30 * 24 * 3600, updateAge: 24 * 3600 },
  pages: { signIn: PageRoutes.LOGIN, error: PageRoutes.LOGIN },
  theme: { logo: Assets.LOGO_SVG },
  // debug: true,
  callbacks: {
    // signIn(params) {
    //   console.log('[next-auth][callbacks.signIn]\n', params)
    //   return true
    // },
    // redirect(params) {
    //   console.log('[next-auth][callbacks.redirect]\n', params)
    //   return params.url
    // },
    // authorized(params) {
    //   console.log('[next-auth][callbacks.authorized]\n', params)
    // },
    jwt(params) {
      // console.log('[next-auth][callbacks.jwt]\n', params)
      if (params.user) {
        params.token.role = params.user.role
      }
      return params.token
    },
    // 控制 auth() 返回的 Session 的数据
    session(params) {
      // console.log('[next-auth][callbacks.session]\n', params)
      const session = params.session
      if (session.user) {
        // 这里的 params.token 是上面 jwt() 的返回
        session.user.id = params.token.sub!
        session.user.isAdmin = params.token.role === 'admin'
      }
      return params.session
    },
  },
} satisfies NextAuthConfig
