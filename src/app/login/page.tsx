'use client'

import { actCheckGithubOAuthConfig, actRegisterUser, actVerifyUser } from '@/actions'
import { ReButton, ReInput } from '@/components'
import { z, zodSchemas } from '@/lib/zod'
import { runAction } from '@/utils'
import { Assets, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { addToast, cn, Form, FormProps, Spinner, Switch } from '@heroui/react'
import { useMount, useSetState } from 'ahooks'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, useSearchParams } from 'next/navigation'
import { FormEvent, useRef, useState } from 'react'
import { Velustro } from 'uvcanvas'

// signIn() 登录失败不会报错，只会重定向到登录页面（当前页面）
// 如果需要禁用这一行为，可在 signIn() 中添加 { redirect: false }
// 登录异常时，会在重定向时带上参数，如：
// - 账号密码登录失败 ?error=CredentialsSignin&code=credentials
// - Github 授权登录失败 ?error=OAuthAccountNotLinked

export default function Page() {
  const session = useSession()
  const searchParams = useSearchParams()

  // 登录成功后，根据用户角色重定向到不同的页面
  if (session.status === 'authenticated') {
    if (session.data.user.isAdmin) {
      return redirect(PageRoutes.INDEX)
    }
    return redirect(PageRoutes.User.INDEX)
  }

  const [state, setState] = useSetState({
    isRedirecting: false,
    showBg: true,
    isRegisterMode: false,
    loginRegisterLoading: false,
    signInError: '',
  })
  const [validationErrors, setValidationErrors] = useState<FormProps['validationErrors']>()

  const formRef = useRef<HTMLFormElement>(null)

  useMount(() => {
    const value = globalThis.localStorage?.getItem('login-show-background')
    if (value === null) return
    setState({ showBg: value === 'true' })
  })

  useMount(() => {
    const error = searchParams.get('error')
    const code = searchParams.get('code')
    if (error === 'CredentialsSignin' && code === 'credentials') {
      setState({ signInError: '账号或密码错误，请检查后重试。' })
    } else if (error === 'OAuthAccountNotLinked') {
      setState({
        signInError: 'Github 账户邮箱已被注册，请直接使用账号密码登录，或更换 Github 账户。',
      })
    }
  })

  async function handleGithubAuth() {
    const res = await runAction(actCheckGithubOAuthConfig())
    if (!res.ok) return
    if (!res.data) {
      addToast({
        color: 'danger',
        description: '由于服务端配置缺失，暂无法使用 Github 登录，可尝试账号密码登录',
      })
      return
    }
    await signIn('github')
    setState({ isRedirecting: true })
  }

  function handleShowBgChange(val: boolean) {
    setState({ showBg: val })
    localStorage.setItem('login-show-background', String(val))
  }

  function toggleRegisterMode() {
    formRef.current?.reset()
    setState({ isRegisterMode: !state.isRegisterMode, signInError: '' })
    setValidationErrors(undefined)
  }

  function validateForm(values: any) {
    const loginSchema = zodSchemas.userCredential
    const registerSchema = loginSchema
      .extend({ confirmPassword: z.string().nonempty('请确认密码') })
      .refine((data) => data.password === data.confirmPassword, {
        message: '两次输入的密码不一致',
        path: ['confirmPassword'],
      })
    setValidationErrors(undefined)
    const result = state.isRegisterMode
      ? registerSchema.safeParse(values)
      : loginSchema.safeParse(values)
    if (result.success) return result.data
    setValidationErrors(result.error.flatten().fieldErrors)
    return false
  }

  async function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    setState({ signInError: '' })
    const formData = Object.fromEntries(new FormData(evt.currentTarget))
    const values = validateForm(formData)
    if (!values) return
    setState({ loginRegisterLoading: true })
    // 注册账号
    if (state.isRegisterMode) {
      const result = await runAction(actRegisterUser(values), { errToast: { title: '注册失败' } })
      setState({ loginRegisterLoading: false })
      if (!result.ok) return
      addToast({ color: 'success', title: '注册成功，请登录' })
      toggleRegisterMode()
      return
    }
    // 登录账号
    const result = await runAction(actVerifyUser(values), { errToast: { hidden: true } })
    setState({ loginRegisterLoading: false })
    if (!result.ok) {
      setState({ signInError: '账号或密码错误，请检查后重试。' })
      return
    }
    addToast({ color: 'success', title: '登录成功' })
    await signIn('credentials', values)
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="justify-between px-6 py-4 flex-items-center">
        <Link href={PageRoutes.INDEX} className={cn('gap-4 rounded-xl backdrop-blur flex-center')}>
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" />
          <h3
            className={cn(
              'translate-y-0.5 font-mono text-2xl font-light leading-none text-foreground-700',
              state.showBg && '!text-white/90'
            )}
          >
            {WEBSITE_NAME}
          </h3>
        </Link>
        <Switch size="sm" isSelected={state.showBg} onValueChange={handleShowBgChange} />
      </div>
      <div className="-mt-[10vh] grow flex-col flex-center">
        <div className="w-96 rounded-xl border bg-background/80 p-10 shadow-lg backdrop-blur max-xs:w-[90%]">
          {state.isRedirecting ? (
            <div className="flex-center">
              <Spinner color="current" size="lg">
                <p className="mt-6 text-sm">正在等待 Github 授权</p>
              </Spinner>
            </div>
          ) : (
            <div>
              <Form ref={formRef} validationErrors={validationErrors} onSubmit={handleSubmit}>
                <ReInput label="邮箱" name="email" type="email" isRequired />
                <ReInput label="密码" name="password" type="password" isRequired />
                {state.isRegisterMode && (
                  <ReInput label="确认密码" name="confirmPassword" type="password" isRequired />
                )}
                <div className="mt-4 text-xs">
                  <button
                    className={cn(
                      'space-x-1 text-primary transition-all flex-items-center hover:opacity-80',
                      state.isRegisterMode && 'text-secondary'
                    )}
                    onClick={toggleRegisterMode}
                  >
                    {state.isRegisterMode && <span className={IconNames.ARROW_LEFT} />}
                    <span>{state.isRegisterMode ? '返回登录' : '还没账号？去注册'}</span>
                    {!state.isRegisterMode && <span className={IconNames.ARROW_RIGHT} />}
                  </button>
                </div>
                <ReButton
                  type="submit"
                  fullWidth
                  color={state.isRegisterMode ? 'secondary' : 'primary'}
                  isLoading={state.loginRegisterLoading}
                >
                  {state.isRegisterMode ? '注册' : '登录'}
                </ReButton>
              </Form>

              <ReButton
                className="mt-8 bg-foreground text-background"
                fullWidth
                startContent={<span className="icon-[mdi--github] text-2xl" />}
                onClick={handleGithubAuth}
              >
                Github 授权登录（免注册）
              </ReButton>

              <div
                role="login-failed-message"
                hidden={!state.signInError}
                className="mt-8 rounded-xl bg-red-50/70 p-4"
              >
                <h3 className="mb-2 gap-1 text-sm text-danger-600 flex-items-center">
                  <span className={IconNames.Tabler.EXCLAMATION_CIRCLE} />
                  <span>登录失败</span>
                </h3>
                <div className="text-xs text-danger-400">{state.signInError}</div>
              </div>
            </div>
          )}
        </div>
      </div>
      {state.showBg && (
        <div className="fixed inset-0 -z-10">
          <Velustro />
        </div>
      )}
    </div>
  )
}
