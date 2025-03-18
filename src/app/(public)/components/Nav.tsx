'use client'

import { NavUser, ReButton, ThemeToggle } from '@/components'
import { Assets, Background, ExternalLinks, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import {
  ButtonProps,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  cn,
} from '@heroui/react'
import { useSetState } from 'ahooks'
import Image from 'next/image'
import Link from 'next/link'
import SearchInput from './SearchInput'

export const NavIconOnlyButtonProps: Required<
  Pick<ButtonProps, 'className' | 'isIconOnly' | 'variant'>
> = {
  className: 'text-2xl text-foreground-600 xs:hover:text-foreground-800 outline-none',
  isIconOnly: true,
  variant: 'light',
}

export default function Nav() {
  const [state, setState] = useSetState({
    isSelectedMenuToggle: false,
  })

  return (
    // 背景色和 @/app/layout.tsx body > div:fist-child 的颜色一致
    <Navbar
      maxWidth="full"
      className={cn(Background.CLASS, 'fixed max-xs:dark:bg-opacity-60')}
      isBlurred
      isBordered
    >
      <NavbarMenuToggle
        className="xs:hidden"
        // isSelected={state.isSelectedMenuToggle}
        onChange={(v) => setState({ isSelectedMenuToggle: v })}
      />
      <NavbarBrand className="grow-0 max-xs:basis-16 xs:basis-56">
        <Link href={PageRoutes.INDEX} className="gap-4 flex-items-center">
          <Image
            src={Assets.LOGO_NO_BG_SVG}
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
        <SearchInput className="w-[32rem] max-xs:hidden" />

        <div className="shrink-0 justify-end gap-1 flex-items-center max-xs:ml-auto">
          <ThemeToggle />
          <ReButton
            {...NavIconOnlyButtonProps}
            href={PageRoutes.Public.RANDOM}
            tooltip={{
              placement: 'bottom-end',
              content: '随便看看',
            }}
          >
            <span className={IconNames.SIEVE} />
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
          <NavUser />
        </div>
      </NavbarContent>

      <NavbarMenu className={cn(Background.CLASS, 'dark:bg-opacity-50')}>
        {/* 没展开的时候，不渲染 */}
        {/* {state.isSelectedMenuToggle && <TagPicker tags={tags} />} */}
      </NavbarMenu>
    </Navbar>
  )
}
