'use client'

import ReInput from '@/components/re-export/ReInput'
import { WEBSITE_NAME } from '@cfg'
import { Navbar, NavbarContent } from '@nextui-org/react'
import { useSetState } from 'ahooks'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'

export default function IndexNav() {
  const [state, setState] = useSetState({ isOpen: false })
  const session = useSession()

  return (
    <Navbar maxWidth="full" className="z-20 bg-slate-950/80">
      {/* 左边始终显示 */}
      <NavbarContent className="max-sm:!flex-grow-0">
        <Link href="/">
          <div className="flex cursor-pointer items-center gap-2">
            <Image
              src="/logo-no-bg.svg"
              width={32}
              height={32}
              className="hidden rounded-lg bg-gray-50 sm:inline-block"
              alt="logo"
              priority
            />
            <h3 className="font-mono text-2xl font-black leading-none">{WEBSITE_NAME}</h3>
          </div>
        </Link>
      </NavbarContent>

      {/* 搜索框始终显示，位置有居中、居左两种情况 */}
      <NavbarContent className="m-0">
        {/* <SearchInput /> */}
        <ReInput placeholder="搜点什么" />
      </NavbarContent>

      <NavbarContent justify="end" className="hidden sm:flex">
        <Link href="/recent">最近更新</Link>
        <div>Github</div>
        {/* <NavUser /> */}
      </NavbarContent>

      {/*
      <NavbarContent className="!flex-grow-0 sm:hidden" justify="end">
        <NavbarMenuToggle
          aria-label="toggle-button"
          id="toggle-button"
          // ref={toggleRef as any}
          onChange={(v) => {
            if (v === true) {
              const div: HTMLDivElement | null = document.querySelector(
                'div.nextui-navbar-collapse'
              )
              if (!div) return
              div.style.display = 'none'
              div.clientHeight
              div.style.display = ''
            }
          }}
        />
        <CollapseContent /> */}
      {/* </NavbarContent> */}
    </Navbar>
  )
}
