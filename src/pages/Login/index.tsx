import { NButton, NIcon } from 'naive-ui'
import classes from '../../style/pages/login.module.css'
import { BrandGithub } from '@vicons/tabler'

// Github OAuth 文档：
// https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#web-application-flow

export default function Login() {
  // 1. 打开新窗口，进行 GitHub 授权
  // 2. 授权成功，重定向至 redirect_uri
  // 3. 在 redirect_uri 页面中调用 API，请求签发 token
  function handleClick() {
    const { href: REDIRECT_URI } = new URL(
      import.meta.env.BASE_URL,
      // ! 本地启动时，先去 https://github.com/settings/developers 设置 Authorization callback URL 为 http://localhost
      import.meta.env.DEV ? location.origin : location.origin,
    )
    const CLIENT_ID = 'e2694ff6d268a2124f44'
    const url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`
    // console.log({ url })
    // return
    location.href = url
  }

  return (
    <div class={classes.root}>
      <NButton
        tertiary
        themeOverrides={{
          fontSizeMedium: '24px',
          iconSizeMedium: '24px',
          colorTertiary: 'hsl(0, 100%, 100%, .55)',
          paddingRoundMedium: '50px',
          textColor: '#fff',
        }}
        round
        onClick={handleClick}
        v-slots={{
          icon: () => (
            <NIcon>
              <BrandGithub />
            </NIcon>
          ),
          default: () => '使用 Github 登录',
        }}
      />
    </div>
  )
}

Login.displayName = 'Login'
