import GithubProvider from 'next-auth/providers/github'

export const githubProvider = GithubProvider({
  // async profile(profile) {
  //   return {
  //     ...pick(profile, ['email', 'name']),
  //     id: profile.id.toString(),
  //     image: profile.avatar_url,
  //   }
  // },
})

// 运行在 Vercel 平台上，不使用代理
if (!process.env.VERCEL) {
  // 有代理优先使用代理
  githubProvider.token = process.env.FETCH_GITHUB_TOKEN_PROXY || githubProvider.token
}
