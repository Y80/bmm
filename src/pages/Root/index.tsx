/**
 * - / 页面对应的组件
 * - 仅用作各种状态的跳转
 */

import * as loginApi from '@api/login'
import { defineComponent, reactive } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const state = reactive({
      tokenVerifying: false,
      timer: 0,
    })
    const router = useRouter()

    setInterval(() => {
      state.timer += 1
    }, 1000)

    // GitHub 授权成功后返回的 code
    let code = router.currentRoute.value.query.code || ''
    // if (!code) {
    //   const matched = location.search.match(/(?<=\?code=)\w{20}/)
    //   code = matched?.[0] || ''
    // }

    const token = localStorage.getItem('token')
    if (code.length === 20) {
      router.push('/oauth?code=' + code)
      return
    } else if (token) {
      state.tokenVerifying = true
      loginApi
        .verify()
        .then(() => {
          // 如果 token 有效，跳转到 /admin
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
        <h2>已检测到 token，正在验证有效性</h2>
        <span class="text-gray-500">耗时：{state.timer}s</span>
      </div>
    )
  },
})
