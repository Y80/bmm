import { http } from './http'

/** 拿着 GitHub 返回的 code 进行认证 */
export function authenticate(code: string) {
  return http.get<null, { token: string }>('/authenticate', { params: { code } })
}

/** 验证已存在的 token 是否有效 */
export function verify() {
  return http.get('/verify')
}
