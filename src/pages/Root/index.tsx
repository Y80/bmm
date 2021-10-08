/**
 * - / 页面对应的组件
 * - 仅用作各种状态的跳转
 */

import router from '../router'
import * as loginApi from '../../api/login'
import { defineComponent, reactive } from 'vue'

async function handleGithubOAuth(code: string) {
  try {
    const { token } = await loginApi.authenticate(code)
    if (!token) throw new Error('认证失败')
    // 通过父窗口关闭当前窗口，父窗口路由至 /admin 页面
    window.opener?.handleSuccessLogin(token)
  } catch {}
}

export default defineComponent({
  setup() {
    const state = reactive({
      tokenVerifying: false,
      githubAuthenticating: false,
    })

    const code = router.currentRoute.value.query.code
    const token = localStorage.getItem('token')
    if (typeof code === 'string' && code.length === 20) {
      state.githubAuthenticating = true
      handleGithubOAuth(code).finally(() => {
        state.githubAuthenticating = false
      })
    } else if (token) {
      // 如果 token 有效，跳转到 /admin
      state.tokenVerifying = true
      loginApi
        .verify()
        .then(() => {
          router.push('/admin')
        })
        .finally(() => {
          state.tokenVerifying = false
        })
    } else {
      router.push('/login')
    }

    return () => (
      <div>
        <div v-show={state.githubAuthenticating}>
          正在处理 Github 认证，请稍后...
        </div>
        <div v-show={state.tokenVerifying}>
          已检测到 token，正在验证有效性...
        </div>
      </div>
    )
  },
})
