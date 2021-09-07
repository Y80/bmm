import { NButton, NIcon } from 'naive-ui'
import classes from '../../style/pages/login.module.css'
import router from '../router'
import { BrandGithub } from '@vicons/tabler'

// https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow

export default function Login() {
  /**
   * 1. 打开新窗口，进行 GitHub 授权
   * 2. 授权成功，重定向至 REDIRECT_URI
   * 3. 在 REDIRECT_URI 页面中请求服务端，请求签发 token
   * 4. 新窗口调用 handleSuccessLogin(), 新窗口被关闭，当前窗口导航至 /admin
   */
  function handleClick() {
    // const REDIRECT_URI = 'http://localhost:3000'
    const REDIRECT_URI = new URL(import.meta.env.BASE_URL, location.origin).href
    const CLIENT_ID = 'e2694ff6d268a2124f44'
    const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`
    console.log({ url })

    const childWindow = window.open(url)
    // 在 Mac Safari 上，跨标签调用 localStorage.setItem() 可能出现 localStorage 不同步的问题
    window.handleSuccessLogin = (token) => {
      localStorage.setItem('token', token)
      childWindow?.close()
      router.replace('/admin')
    }
  }

  return (
    <div class={classes.root}>
      <NButton
        type="primary"
        size="large"
        round
        onClick={handleClick}
        v-slots={{
          icon: () => (
            <NIcon>
              <BrandGithub />
            </NIcon>
          ),
        }}
      >
        使用 Github 登录
      </NButton>
    </div>
  )
}

Login.displayName = 'Login'
