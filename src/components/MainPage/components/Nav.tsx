'use client'

import ThemeToggle from '@/components/ThemeToggle'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import { Background, ExternalLinks, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import {
  ButtonProps,
  Kbd,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
} from '@nextui-org/react'
import { useDebounceEffect, useEventListener, useMemoizedFn, useMount, useSetState } from 'ahooks'
import clsx from 'clsx'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import TagPicker from './TagPicker'
import User from './User'

export const NavIconOnlyButtonProps: Required<
  Pick<ButtonProps, 'className' | 'isIconOnly' | 'variant'>
> = {
  className: 'text-2xl text-foreground-600 xs:hover:text-foreground-800 outline-none',
  isIconOnly: true,
  variant: 'light',
}

export default function Nav() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = useSetState({
    input: searchParams.get('keyword') || '',
    focusInput: false,
    isSelectedMenuToggle: false,
  })
  const inputRef = useRef<null | HTMLDivElement>(null)

  const handleSearch = useMemoizedFn(() => {
    const keyword = state.input.trim()
    if (keyword === (searchParams.get('keyword') || '')) {
      return
    }
    router.push(keyword ? PageRoutes.Public.search(keyword) : '/')
  })

  // 按下回车键，执行搜索
  useEventListener(
    'keydown',
    (e) => {
      if (e.key !== 'Enter') return
      handleSearch()
    },
    { target: inputRef }
  )

  useEventListener('keydown', (e) => {
    // if (e.metaKey && e.key === 'k') {
    if (e.key === '/') {
      setTimeout(() => {
        inputRef.current!.querySelector('input')?.focus()
      })
    }
  })

  useDebounceEffect(() => handleSearch(), [state.input], {
    wait: 500,
    leading: false,
    trailing: true,
  })

  useMount(() => {
    if (location.pathname === PageRoutes.Public.SEARCH && inputRef.current) {
      inputRef.current.querySelector('input')?.focus()
    }
  })

  return (
    // 背景色和 @/app/layout.tsx body > div:fist-child 的颜色一致
    <Navbar
      maxWidth="full"
      className={clsx(Background.CLASS, 'max-xs:dark:bg-opacity-60')}
      isBlurred
      disableAnimation
    >
      <NavbarMenuToggle
        className="xs:hidden"
        // isSelected={state.isSelectedMenuToggle}
        onChange={(v) => setState({ isSelectedMenuToggle: v })}
      />
      <NavbarBrand className="grow-0 max-xs:basis-16 xs:basis-56">
        <Link href="/" className="gap-4 flex-items-center">
          <Image
            src="/logo-no-bg.svg"
            width={32}
            height={32}
            className="rounded-lg dark:bg-gray-50"
            alt="logo"
            priority
          />
          <h3 className="translate-y-0.5 font-mono text-2xl font-light leading-none text-foreground-700">
            {WEBSITE_NAME}
          </h3>
        </Link>
      </NavbarBrand>

      <NavbarContent className="m-0 !justify-between">
        <div className="w-36 max-xs:hidden" />
        <ReInput
          value={state.input}
          placeholder={state.focusInput ? '可根据网站名称、拼音、简介搜索' : 'Search...'}
          className="w-[32rem] max-xs:hidden"
          fullWidth={false}
          classNames={{ inputWrapper: 'dark:bg-opacity-50' }}
          baseRef={inputRef}
          startContent={<span className={IconNames.SEARCH} />}
          endContent={
            !state.focusInput && !state.input && <Kbd className="px-3 dark:opacity-80">/</Kbd>
          }
          onClear={state.input ? () => router.push('/') : undefined}
          onValueChange={(v) => setState({ input: v })}
          onFocusChange={(v) => setState({ focusInput: v })}
        />

        <div className="shrink-0 justify-end gap-1 flex-items-center max-xs:ml-auto">
          <User className="max-xs:hidden" />
          <ThemeToggle />
          <ReButton
            {...NavIconOnlyButtonProps}
            href="/recent"
            tooltip={{
              placement: 'bottom-end',
              content: '最近更新',
            }}
          >
            <span className="icon-[tabler--clock-plus]" />
          </ReButton>
          <ReButton
            {...NavIconOnlyButtonProps}
            href={ExternalLinks.REPO}
            target="_blank"
            rel="noreferrer"
            tooltip={{
              placement: 'bottom-end',
              content: (
                <div className="p-2">
                  <ReButton
                    className="bg-gradient-to-tr from-rose-500/80 to-purple-500 px-8"
                    href={ExternalLinks.REPO}
                    target="_blank"
                    rel="noreferrer"
                    startContent={
                      <span className="icon-[tabler--star-filled] text-xl text-yellow-400" />
                    }
                  >
                    <span className="text-white">欢迎 Star</span>
                  </ReButton>
                </div>
              ),
            }}
          >
            <span className={IconNames.GITHUB} />
          </ReButton>
        </div>
      </NavbarContent>

      <NavbarMenu className={clsx(Background.CLASS, 'dark:bg-opacity-50')}>
        {/* 没展开的时候，不渲染 */}
        {state.isSelectedMenuToggle && <TagPicker />}
      </NavbarMenu>
    </Navbar>
  )
}
