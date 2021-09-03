import { http } from './http'

export function authenticate(code: string) {
  return http.get<null, { token: string }>('/authenticate', { params: { code } })
}

/** 验证已存在的 token 是否有效 */
export function verify() {
  return http.get('/verify')
}
