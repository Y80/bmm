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
import { usePathname } from 'next/navigation'
import { SearchInput } from './SearchInput'

const UserLinkGroups = [
  {
    key: 'bookmark',
    icon: IconNames.BOOKMARK,
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
    icon: IconNames.TAG,
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
  const pathname = usePathname()
  const isUserSpace = usePageUtil().isUserSpace
  const routes = isUserSpace ? PageRoutes.User : PageRoutes.Public
  const user = session?.data?.user
  const [state, setState] = useSetState({
    isSelectedMenuToggle: false,
  })

  function showSearchInput() {
    if (!totalBookmarks) return false
    if (!isUserSpace) return true
    const userRoutes = PageRoutes.User
    if (
      [userRoutes.INDEX, userRoutes.RANDOM, userRoutes.SEARCH].includes(pathname as any) ||
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
      <NavbarBrand className="shrink-0 grow-0 max-xs:basis-20 xs:basis-56">
        <Link href={routes.INDEX} className="gap-4 flex-items-center">
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" priority />
          <h3 className="translate-y-0.5 font-mono text-2xl font-light text-foreground-700">
            {isUserSpace ? user?.name : WEBSITE_NAME}
          </h3>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end" className="gap-0">
        {/* pathname 发生变化时，重新渲染 SearchInput */}
        {showSearchInput() && <SearchInput key={pathname} className="mr-4 w-72 max-xs:hidden" />}
        {isUserSpace &&
          UserLinkGroups.map((group) => (
            <ReButton
              key={group.key}
              {...IconButtonProps}
              className={cn(IconButtonProps.className, 'max-xs:hidden')}
              href={group.list[1].href}
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
        <MobileTagPicker
          tags={tags}
          onCloseMenu={() => setState({ isSelectedMenuToggle: false })}
        />
      </NavbarMenu>

      <div className="hidden" role="navigation" aria-hidden="false">
        {tags.map((tag) => (
          <a key={tag.id} {...getTagLinkAttrs(tag)}>
            {tag.name}
          </a>
        ))}
      </div>
    </Navbar>
  )
}
