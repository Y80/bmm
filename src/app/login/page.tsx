'use client'

import { ReButton } from '@/components'
import { Assets, PageRoutes, WEBSITE_NAME } from '@cfg'
import { cn, Spinner, Switch } from '@heroui/react'
import { useSetState } from 'ahooks'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { Velustro } from 'uvcanvas'

export default function Page() {
  const [state, setState] = useSetState({
    isRedirecting: false,
    showBg: true,
  })
  useEffect(() => {
    const value = globalThis.localStorage?.getItem('login-show-background')
    if (value === null) return
    setState({ showBg: value === 'true' })
  }, [setState])

  async function handleLogin() {
    await signIn('github', { redirectTo: PageRoutes.INDEX })
    setState({ isRedirecting: true })
  }

  function handleShowBgChange(val: boolean) {
    setState({ showBg: val })
    localStorage.setItem('login-show-background', String(val))
  }

  const tipTextCls = 'text-black/60 text-sm'

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
        <h1
          className={cn(
            'mb-4 font-serif text-4xl text-foreground-700',
            state.showBg && '!text-black/80'
          )}
        >
          Log in to {WEBSITE_NAME}
        </h1>
        <div className="w-96 rounded-xl p-10 backdrop-blur light:bg-black/10 dark:bg-white/30">
          {state.isRedirecting ? (
            <div className="flex-center">
              <Spinner color="current" size="lg" className="text-black/65">
                <p className={cn('mt-6', tipTextCls)}>正在等待 Github 授权</p>
              </Spinner>
            </div>
          ) : (
            <div>
              <ReButton
                className="bg-black text-white hover:bg-black/80"
                size="lg"
                fullWidth
                startContent={<span className={cn('icon-[mdi--github]', 'text-2xl')} />}
                onClick={handleLogin}
              >
                Continue with Github
              </ReButton>
              <div className="mt-6" />
              <li className={tipTextCls}>
                请保证您可访问{' '}
                <a
                  target="_blank"
                  href="https://github.com"
                  className="underline underline-offset-4"
                >
                  github.com
                </a>
              </li>
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
