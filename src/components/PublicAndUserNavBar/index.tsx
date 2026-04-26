'use client'

import { NavUser, ReButton, ThemeToggle } from '@/components'
import { IconButtonProps, NavBarProps } from '@/components/common'
import { MobileTagPicker } from '@/components/MobileTagPicker'
import { usePageUtil } from '@/hooks'
import { getTagLinkAttrs } from '@/utils'
import { Assets, Background, ExternalLinks, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import {
  cn,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
} from '@heroui/react'
import { useSetState } from 'ahooks'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SearchInput } from './SearchInput'

interface Props {
  totalBookmarks: number
  tags: SelectTag[]
}

export function PublicAndUserNavbar(props: Props) {
  const { totalBookmarks, tags } = props
  const session = useSession()
  const pathname = usePathname()
  const isUserSpace = usePageUtil().isUserSpace
  const routes = isUserSpace ? PageRoutes.User : PageRoutes.Public
  const homeHref = isUserSpace ? PageRoutes.User.SPACE : PageRoutes.Public.INDEX
  const user = session?.data?.user
  const [state, setState] = useSetState({
    isSelectedMenuToggle: false,
  })

  function showSearchInput() {
    if (!totalBookmarks) return false
    if (!isUserSpace) return true
    const userRoutes = PageRoutes.User
    if (
      [userRoutes.SPACE, userRoutes.RANDOM, userRoutes.SEARCH].includes(pathname as any) ||
      pathname.startsWith(userRoutes.tags())
    ) {
      return true
    }
  }

  return (
    <Navbar
      {...NavBarProps}
      isMenuOpen={state.isSelectedMenuToggle}
      onMenuOpenChange={(v) => setState({ isSelectedMenuToggle: v })}
    >
      <NavbarBrand className="xs:basis-60 min-w-0 shrink grow-0 basis-auto">
        <Link
          href={homeHref}
          className="group flex min-w-0 items-center gap-2.5 rounded-2xl px-1 py-1.5 no-underline sm:gap-3"
        >
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-[20px] border border-slate-200/85 bg-gradient-to-br from-white/[0.62] via-white/[0.52] to-slate-100/80 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.14)] backdrop-blur-md transition-[background-color,box-shadow,transform] duration-150 group-hover:bg-white/[0.72] sm:size-11 sm:rounded-2xl dark:border-white/10 dark:from-white/[0.12] dark:via-white/[0.08] dark:to-white/[0.04] dark:group-hover:bg-white/[0.08] dark:group-hover:shadow-none">
            <Image src={Assets.LOGO_SVG} width={24} height={24} alt="logo" priority />
          </div>
          <h3 className="text-foreground translate-y-0.5 truncate text-lg font-semibold tracking-tight sm:text-xl">
            {isUserSpace ? user?.name : WEBSITE_NAME}
          </h3>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end" className="gap-1.5 sm:gap-2">
        {/* pathname 发生变化时，重新渲染 SearchInput */}
        {showSearchInput() && (
          <SearchInput key={pathname} className="max-xs:hidden mr-1 w-[min(36vw,460px)]" />
        )}
        <ReButton
          {...IconButtonProps}
          className={cn(IconButtonProps.className, !totalBookmarks && 'hidden', 'max-xs:hidden')}
          href={isUserSpace ? PageRoutes.User.RANDOM : PageRoutes.Public.RANDOM}
          tooltip="随便看看"
          startContent={<span className={IconNames.Tabler.DICE_3} />}
        />
        <ThemeToggle />
        <ReButton
          {...IconButtonProps}
          href={ExternalLinks.REPO}
          target="_blank"
          rel="noreferrer"
          tooltip={{
            placement: 'bottom-end',
            content: (
              <div className="flex-center gap-2 p-2">
                <span className={cn(IconNames.Tabler.STAR_FILLED, 'text-xl text-yellow-400')} />
                <span>欢迎 Star</span>
              </div>
            ),
          }}
        >
          <span className={IconNames.Tabler.BRAND_GITHUB} />
        </ReButton>
        <NavUser />
      </NavbarContent>
      {showSearchInput() && (
        <div className="xs:hidden order-last basis-full px-4 pt-1 pb-3">
          <SearchInput key={`${pathname}-mobile`} className="w-full" compact />
        </div>
      )}
      <NavbarMenuToggle className="xs:hidden ml-0.5" />
      <NavbarMenu className={cn(Background.CLASS)}>
        <MobileTagPicker
          tags={tags}
          onCloseMenu={() => setState({ isSelectedMenuToggle: false })}
        />
      </NavbarMenu>

      <div role="navigation" className="fixed left-full">
        {tags.map((tag) => (
          <a key={tag.id} {...getTagLinkAttrs(tag)}>
            {tag.name}
          </a>
        ))}
      </div>
    </Navbar>
  )
}
