'use client'

import { NavUser, ReButton, ThemeToggle } from '@/components'
import { IconButtonProps, NavBarProps } from '@/components/common'
import { MobileTagPicker } from '@/components/MobileTagPicker'
import SearchInput from '@/components/SearchInput'
import { useIsMobile, usePageUtil } from '@/hooks'
import { Assets, Background, ExternalLinks, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import {
  cn,
  Link,
  Listbox,
  ListboxItem,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
} from '@heroui/react'
import { useSetState } from 'ahooks'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

const UserLinkGroups = [
  {
    key: 'bookmark',
    icon: IconNames.Huge.BOOKMARK,
    list: [
      {
        label: '新建书签',
        href: PageRoutes.User.bookmarkSlug('new'),
        icon: IconNames.Huge.ADD_SQUARE,
      },
      {
        label: '书签列表',
        href: PageRoutes.User.bookmarkSlug('list'),
        icon: IconNames.Huge.LIST,
      },
    ],
  },
  {
    key: 'tag',
    icon: IconNames.Huge.TAG,
    list: [
      {
        label: '新建标签',
        href: PageRoutes.User.tagSlug('new'),
        icon: IconNames.Huge.ADD_SQUARE,
      },
      {
        label: '标签列表',
        href: PageRoutes.User.tagSlug('list'),
        icon: IconNames.Huge.LIST,
      },
    ],
  },
]

interface Props {
  totalBookmarks: number
  tags: SelectTag[]
}

export function PublicAndUserNavbar(props: Props) {
  const { totalBookmarks, tags } = props
  const session = useSession()
  const isMobile = useIsMobile()
  const isUserSpace = usePageUtil().isUserSpace
  const routes = isUserSpace ? PageRoutes.User : PageRoutes.Public
  const user = session?.data?.user
  const [state, setState] = useSetState({
    isSelectedMenuToggle: false,
  })

  return (
    <Navbar
      {...NavBarProps}
      isMenuOpen={state.isSelectedMenuToggle}
      onMenuOpenChange={(v) => setState({ isSelectedMenuToggle: v })}
    >
      <NavbarBrand className="shrink-0 grow-0 max-xs:basis-20 xs:basis-56">
        <Link href={routes.INDEX} className="gap-4 flex-items-center">
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" priority />
          <h3 className="translate-y-0.5 font-mono text-2xl font-light text-foreground-700">
            {isUserSpace ? user?.name : WEBSITE_NAME}
          </h3>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end" className="gap-0">
        {!!totalBookmarks && <SearchInput className="mr-4 w-72 max-xs:hidden" />}
        {isUserSpace &&
          !isMobile &&
          UserLinkGroups.map((group) => (
            <ReButton
              key={group.key}
              {...IconButtonProps}
              tooltip={{
                placement: 'top-start',
                content: (
                  <Listbox label={group.key}>
                    {group.list.map((el) => (
                      <ListboxItem
                        key={el.label}
                        href={el.href}
                        className="w-28"
                        startContent={<span className={cn(el.icon, 'text-base')} />}
                      >
                        {el.label}
                      </ListboxItem>
                    ))}
                  </Listbox>
                ),
              }}
            >
              <span className={group.icon} />
            </ReButton>
          ))}
        <ReButton
          {...IconButtonProps}
          className={cn(IconButtonProps.className, !totalBookmarks && 'hidden', 'max-xs:hidden')}
          href={isUserSpace ? PageRoutes.User.RANDOM : PageRoutes.Public.RANDOM}
          tooltip="随便看看"
          startContent={<span className={IconNames.SIEVE} />}
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
              <div className="gap-2 p-2 flex-center">
                <span className="icon-[tabler--star-filled] text-xl text-yellow-400" />
                <span>欢迎 Star</span>
              </div>
            ),
          }}
        >
          <span className={IconNames.GITHUB} />
        </ReButton>
        <NavUser />
      </NavbarContent>

      <NavbarMenuToggle className="xs:hidden" />
      <NavbarMenu className={cn(Background.CLASS, 'dark:bg-opacity-50')}>
        <MobileTagPicker tags={tags} />
      </NavbarMenu>
    </Navbar>
  )
}
