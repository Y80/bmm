'use client'

import { NavUser, ReButton, ThemeToggle } from '@/components'
import { IconButtonProps, NavBarProps } from '@/components/common'
import { NavTagPicker } from '@/components/NavTagPicker'
import SearchInput from '@/components/SearchInput'
import { Assets, Background, ExternalLinks, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuToggle, cn } from '@heroui/react'
import { useSetState } from 'ahooks'
import Image from 'next/image'
import Link from 'next/link'
import { usePublicContext } from '../ctx'

export default function Nav() {
  const { totalBookmarks, tags } = usePublicContext()
  const [state, setState] = useSetState({
    isSelectedMenuToggle: false,
  })

  return (
    <Navbar {...NavBarProps}>
      <NavbarBrand className="grow-0 max-xs:basis-16 xs:basis-56">
        <Link href={PageRoutes.INDEX} className="gap-4 flex-items-center">
          <Image
            src={Assets.LOGO_NO_BG_SVG}
            className="rounded-lg dark:bg-gray-50"
            width={32}
            height={32}
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
        {!!totalBookmarks && <SearchInput className="w-[32rem] max-xs:hidden" />}

        <div className="shrink-0 justify-end gap-1 flex-items-center max-xs:ml-auto">
          <ThemeToggle />
          <ReButton
            {...IconButtonProps}
            className={cn(IconButtonProps.className, !totalBookmarks && 'hidden')}
            href={PageRoutes.Public.RANDOM}
            tooltip={{
              placement: 'bottom-end',
              content: '随便看看',
            }}
          >
            <span className={IconNames.SIEVE} />
          </ReButton>
          <ReButton
            {...IconButtonProps}
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

      <NavbarMenuToggle
        className="xs:hidden"
        onChange={(v) => setState({ isSelectedMenuToggle: v })}
      />

      <NavbarMenu className={cn(Background.CLASS, 'dark:bg-opacity-50')}>
        {/* 没展开的时候，不渲染 */}
        {state.isSelectedMenuToggle && <NavTagPicker tags={tags} />}
      </NavbarMenu>
    </Navbar>
  )
}
