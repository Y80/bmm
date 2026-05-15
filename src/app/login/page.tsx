'use client'

import { actCheckGithubOAuthConfig, actRegisterUser, actVerifyUser } from '@/actions'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import { z, zodSchemas } from '@/lib/zod'
import { runAction } from '@/utils/client'
import type { ErrorPageParam, SignInPageErrorParam } from '@auth/core/types'
import { IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { addToast, cn, Form, FormProps, Spinner } from '@heroui/react'
import { useMount, useSetState } from 'ahooks'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import { redirect, useSearchParams } from 'next/navigation'
import { FormEvent, useRef, useState } from 'react'

// signIn() 登录失败不会报错，只会重定向到登录页面（当前页面）
// 如果需要禁用这一行为，可在 signIn() 中添加 { redirect: false }
// 登录异常时，会在重定向时带上参数

export default function Page() {
  const session = useSession()
  const searchParams = useSearchParams()

  const [state, setState] = useSetState({
    isRedirecting: false,
    isRegisterMode: false,
    loginRegisterLoading: false,
    authError: null as null | { title: string; desc: string },
  })
  const [validationErrors, setValidationErrors] = useState<FormProps['validationErrors']>()

  const formRef = useRef<HTMLFormElement>(null)

  useMount(() => {
    const error = searchParams.get('error') as null | SignInPageErrorParam | ErrorPageParam
    const code = searchParams.get('code')
    const authError: typeof state.authError = { title: '', desc: '' }
    if (error === 'CredentialsSignin' && code === 'credentials') {
      authError.title = '登录失败'
      authError.desc = '账号或密码错误，请检查后重试。'
    } else if (error === 'OAuthAccountNotLinked') {
      authError.title = '登录失败'
      authError.desc = 'Github 账户邮箱已被注册，请直接使用账号密码登录，或更换 Github 账户。'
    } else if (error === 'Configuration') {
      authError.title = '登录失败'
      authError.desc =
        '若您正在进行 Github 授权，可能是服务端请求 Github 服务器超时，可多次重试。若问题持续存在，请联系管理员查看服务日志或应用配置。'
    }
    authError.title && setState({ authError })
  })

  // 登录成功后，根据用户角色重定向到不同的页面
  if (session.status === 'authenticated') {
    if (session.data.user.isAdmin) {
      return redirect(PageRoutes.INDEX)
    }
    return redirect(PageRoutes.User.INDEX)
  }

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

  function toggleRegisterMode() {
    formRef.current?.reset()
    setState({ isRegisterMode: !state.isRegisterMode, authError: null })
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
    setValidationErrors(toFormValidationErrors(result.error.flatten().fieldErrors))
    return false
  }

  function toFormValidationErrors(fieldErrors: Record<string, string[] | undefined>) {
    return Object.fromEntries(
      Object.entries(fieldErrors)
        .map(([key, messages]) => [key, messages?.[0]])
        .filter((item): item is [string, string] => Boolean(item[1]))
    )
  }

  async function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault()
    setState({ authError: null })
    const formData = Object.fromEntries(new FormData(evt.currentTarget))
    const values = validateForm(formData)
    if (!values) return
    setState({ loginRegisterLoading: true })
    // 注册账号
    if (state.isRegisterMode) {
      const result = await runAction(actRegisterUser(values), { errToast: { hidden: true } })
      setState({ loginRegisterLoading: false })
      if (!result.ok) {
        setState({ authError: { title: '注册失败', desc: result.message } })
        return
      }
      addToast({ color: 'success', title: '注册成功，请登录' })
      toggleRegisterMode()
      return
    }
    // 登录账号
    const result = await runAction(actVerifyUser(values), { errToast: { hidden: true } })
    setState({ loginRegisterLoading: false })
    if (!result.ok) {
      setState({ authError: { title: '登录失败', desc: result.message } })
      return
    }
    addToast({ color: 'success', title: '登录成功' })
    await signIn('credentials', values)
  }

  return (
    <main className="bg-background text-foreground relative grid min-h-screen place-items-center overflow-hidden px-5 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--heroui-primary)/0.1),transparent_34%),linear-gradient(145deg,hsl(var(--heroui-content2)/0.65),hsl(var(--heroui-background))_52%,hsl(var(--heroui-default-100)/0.42))]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(#dde3ec 1px, transparent 1px), linear-gradient(90deg, #dde3ec 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(circle at center, black, transparent 76%)',
        }}
      />
      <section className="border-divider bg-content1/96 relative z-10 w-full max-w-[400px] overflow-hidden rounded-2xl border p-6 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.42)] backdrop-blur-xl sm:p-7">
        <div className="relative">
          <div className="flex flex-col items-center text-center">
            <div className="bg-content1 flex-center size-20 rounded-2xl border-1">
              <Image src="/logo-no-bg.svg" width={62} height={62} alt="logo" priority />
            </div>
            <p className="mt-4 text-3xl leading-9 font-semibold">
              {state.isRegisterMode ? `注册 ${WEBSITE_NAME}` : `登录 ${WEBSITE_NAME}`}
            </p>
          </div>

          {state.isRedirecting ? (
            <div className="border-divider bg-content2 mt-7 rounded-2xl border px-8 py-12 text-center">
              <Spinner color="current" size="lg" />
              <p className="text-default-700 mt-6 text-sm font-medium">正在等待 Github 授权</p>
            </div>
          ) : (
            <>
              <Form
                ref={formRef}
                validationErrors={validationErrors}
                validationBehavior="aria"
                onSubmit={handleSubmit}
                className="mt-6 w-full items-stretch"
              >
                <ReInput label="邮箱" name="email" type="email" isRequired />
                <ReInput
                  label="密码"
                  name="password"
                  type="password"
                  isRequired
                  minLength={6}
                  maxLength={32}
                />
                {state.isRegisterMode && (
                  <ReInput
                    label="确认密码"
                    name="confirmPassword"
                    type="password"
                    isRequired
                    minLength={6}
                    maxLength={32}
                  />
                )}
                <div className="mt-4">
                  <ReButton buttonType="link" type="button" size="sm" onClick={toggleRegisterMode}>
                    <span
                      className={cn(IconNames.Tabler.ARROW_LEFT, !state.isRegisterMode && 'hidden')}
                    />
                    <span>{state.isRegisterMode ? '返回登录' : '还没有账号？注册'}</span>
                    <span
                      className={cn(IconNames.Tabler.ARROW_RIGHT, state.isRegisterMode && 'hidden')}
                    />
                  </ReButton>
                </div>
                <ReButton
                  type="submit"
                  fullWidth
                  color={state.isRegisterMode ? 'secondary' : 'primary'}
                  isLoading={state.loginRegisterLoading}
                  className="mt-2 h-11 rounded-xl font-medium"
                >
                  {state.isRegisterMode ? '注册账号' : '登录'}
                </ReButton>
              </Form>

              <div className="my-5 flex items-center gap-3">
                <div className="bg-divider h-px flex-1" />
                <span className="text-default-400 text-xs font-medium">或</span>
                <div className="bg-divider h-px flex-1" />
              </div>

              <ReButton
                fullWidth
                variant="bordered"
                className="border-divider bg-content1 text-default-700 hover:bg-content2 h-11 rounded-xl font-medium shadow-sm shadow-black/5"
                startContent={<span className={cn(IconNames.Mdi.GITHUB, 'text-xl')} />}
                onClick={handleGithubAuth}
              >
                Github 授权登录
              </ReButton>

              {state.authError && (
                <div
                  role="alert"
                  className="border-danger-200 bg-danger-50 mt-5 rounded-2xl border p-4"
                >
                  <div className="text-danger-700 flex items-center gap-2 text-sm font-semibold">
                    <span className={IconNames.Tabler.EXCLAMATION_CIRCLE} />
                    <span>{state.authError.title}</span>
                  </div>
                  <p className="text-danger-600 mt-1 text-xs leading-5">{state.authError.desc}</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}
