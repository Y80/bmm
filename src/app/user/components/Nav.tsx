'use client'

import { NavUser, ReButton, ThemeToggle } from '@/components'
import { NavBarProps } from '@/components/common'
import SearchInput from '@/components/SearchInput'
import { useIsMobile } from '@/hooks'
import { Assets, IconNames, PageRoutes } from '@cfg'
import {
  ButtonProps,
  cn,
  Link,
  Listbox,
  ListboxItem,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenuToggle,
} from '@heroui/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useUserContext } from '../ctx'

const IconButtonProps = {
  isIconOnly: true,
  variant: 'light',
  className: 'text-2xl text-foreground-700',
} satisfies ButtonProps

const LinkGroups = [
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

export default function UserNav() {
  const { totalBookmarks } = useUserContext()
  const session = useSession()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const user = session?.data?.user

  if (!user) return null

  function showSearchInput() {
    if (!totalBookmarks || isMobile) return false
    return (
      pathname === PageRoutes.User.RANDOM ||
      pathname === PageRoutes.User.SEARCH ||
      pathname === PageRoutes.User.INDEX ||
      pathname.startsWith(PageRoutes.User.tags())
    )
  }

  return (
    <Navbar {...NavBarProps}>
      <NavbarBrand className="shrink-0 grow-0 max-xs:basis-20 xs:basis-56">
        <Link href={PageRoutes.INDEX} className="gap-4 flex-items-center">
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" priority />
          <h3 className="translate-y-0.5 font-mono text-2xl font-light leading-none text-foreground-700">
            {user.name || 'User'}
          </h3>
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end" className="gap-0">
        {showSearchInput() && <SearchInput className="mr-4 w-72" />}
        {/* <ReButton {...IconButtonProps} href={PageRoutes.User.INDEX}>
          <span className={IconNames.Huge.HOME} />
        </ReButton> */}
        {LinkGroups.map((group) => (
          <ReButton
            key={group.key}
            {...IconButtonProps}
            tooltip={{
              adaptMobile: true,
              placement: 'top-start',
              content: (
                <Listbox label={group.key}>
                  {group.list.map((el) => (
                    <ListboxItem
                      key={el.label}
                      href={el.href}
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
          className={cn(
            IconButtonProps.className,
            'text-foreground-600',
            (!totalBookmarks || isMobile) && 'hidden'
          )}
          href={PageRoutes.User.RANDOM}
          tooltip="随便看看"
          startContent={<span className={IconNames.SIEVE} />}
        />
        <ThemeToggle />
        <NavUser />
      </NavbarContent>

      <NavbarMenuToggle
        className="xs:hidden"
        // onChange={(v) => setState({ isSelectedMenuToggle: v })}
      />

      {/* <NavbarMenu className={cn(Background.CLASS, 'dark:bg-opacity-50')}>
        {state.isSelectedMenuToggle && <NavTagPicker tags={tags} />}
      </NavbarMenu> */}
    </Navbar>
  )
}
