import { NButton, NIcon, NResult, NSpace } from 'naive-ui'
import { defineComponent, reactive } from 'vue'
import classes from '@style/pages/oauth.module.css'
import { BrandGithub } from '@vicons/tabler'
import router from './router'
import * as loginApi from '@api/login'

export default defineComponent({
  setup() {
    const code = router.currentRoute.value.query.code as string
    if (!code) {
      router.push('/login')
      return
    }

    const state = reactive({
      failed: false,
      isAuthenticating: false,
      timeCounter: 0,
      errMsg: '',
    })
    function authenticate() {
      state.isAuthenticating = true
      state.failed = false
      const timer = setInterval(() => {
        state.timeCounter += 1
      }, 1000)
      loginApi
        .authenticate(code)
        .then(({ token }) => {
          localStorage.setItem('token', token)
          router.push('/admin')
        })
        .catch((err) => {
          state.failed = true
          state.errMsg = err.message
        })
        .finally(() => {
          state.isAuthenticating = false
          clearInterval(timer)
          state.timeCounter = 0
        })
    }

    authenticate()

    return () => (
      <div class={classes.root}>
        <NSpace v-show={state.isAuthenticating} justify="center" vertical align="center">
          <NIcon style={{ transform: 'scale(2)' }}>
            <BrandGithub />
          </NIcon>
          <h3>正在认证 Github 账户</h3>
          <span>耗时：{state.timeCounter}s</span>
        </NSpace>

        <NResult
          v-show={state.failed}
          title="认证失败"
          description={state.errMsg}
          status="error"
          v-slots={{
            footer: () => (
              <NSpace vertical style={{ width: '360px', margin: '0 auto' }}>
                <NButton block onClick={authenticate} type="primary">
                  重试
                </NButton>
                <NButton block onClick={() => router.push('/login')}>
                  跳转登录页面
                </NButton>
              </NSpace>
            ),
          }}
        />
      </div>
    )
  },
})
