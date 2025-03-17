'use client'

import { ReButton } from '@/components'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { cn, Spinner } from '@heroui/react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Velustro } from 'uvcanvas'

export default function Page() {
  const [isRedirecting, setIsRedirecting] = useState(false)

  async function handleLogin() {
    await signIn('github', { redirectTo: PageRoutes.INDEX })
    setIsRedirecting(true)
  }

  const tipTextCls = 'text-black/60 text-sm'

  return (
    <>
      <Link href="/" className="fixed left-6 top-4 rounded-xl bg-white/30 backdrop-blur">
        <Image src="/logo-no-bg.svg" width={42} height={42} alt="logo" />
      </Link>
      <div className="grow flex-col flex-center">
        <h1 className="mb-4 text-4xl text-black/65">Log in to {WEBSITE_NAME}</h1>
        <div className="w-96 rounded-xl bg-white/30 p-10 backdrop-blur">
          {isRedirecting ? (
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
      <div className="fixed inset-0 -z-10">
        <Velustro />
      </div>
    </>
  )
}
