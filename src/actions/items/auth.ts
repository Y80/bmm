export async function checkGithubOAuthConfig() {
  return !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET)
}
