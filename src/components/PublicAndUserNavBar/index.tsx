'use client'

import { NavUser, ReButton, ThemeToggle } from '@/components'
import { IconButtonProps, NavBarProps } from '@/components/common'
import { MobileTagPicker } from '@/components/MobileTagPicker'
import { usePageUtil } from '@/hooks'
import { getTagLinkAttrs } from '@/utils'
import { Assets, Background, ExternalLinks, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { cn, Link, Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuToggle } from '@heroui/react'
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
      <NavbarBrand className="max-xs:basis-20 xs:basis-56 shrink-0 grow-0">
        <Link href={homeHref} className="flex-items-center gap-4">
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" priority />
          <h3 className="text-foreground-700 translate-y-0.5 font-mono text-2xl font-light">
            {isUserSpace ? user?.name : WEBSITE_NAME}
          </h3>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end" className="gap-0">
        {/* pathname 发生变化时，重新渲染 SearchInput */}
        {showSearchInput() && <SearchInput key={pathname} className="max-xs:hidden mr-4 w-72" />}
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
      <NavbarMenuToggle className="xs:hidden" />
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
