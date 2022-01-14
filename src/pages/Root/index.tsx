/**
 * - / 页面对应的组件
 * - 仅用作各种状态的跳转
 */

import router from '../router'
import * as loginApi from '../../api/login'
import { defineComponent, reactive } from 'vue'

export default defineComponent({
  setup() {
    const state = reactive({
      tokenVerifying: false,
      timer: 0,
    })

    setInterval(() => {
      state.timer += 1
    }, 1000)

    // GitHub 授权成功后返回的 code
    const code = router.currentRoute.value.query.code
    const token = localStorage.getItem('token')
    if (typeof code === 'string' && code.length === 20) {
      router.push('/oauth?code=' + code)
      return
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        v-show={state.tokenVerifying}
      >
        <h3>已检测到 token，正在验证有效性</h3>
        <span>耗时：{state.timer}s</span>
      </div>
    )
  },
})
