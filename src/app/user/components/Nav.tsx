'use client'

import { NavUser, ReButton, ThemeToggle } from '@/components'
import { NavBarProps } from '@/components/common'
import SearchInput from '@/components/SearchInput'
import { Assets, IconNames, PageRoutes } from '@cfg'
import { ButtonProps, cn, Link, Listbox, ListboxItem, Navbar, NavbarContent } from '@heroui/react'
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
  const user = session?.data?.user

  if (!user) return null

  function showSearchInput() {
    if (!totalBookmarks) return false
    return (
      pathname === PageRoutes.User.RANDOM ||
      pathname === PageRoutes.User.SEARCH ||
      pathname === PageRoutes.User.INDEX ||
      pathname.startsWith(PageRoutes.User.tags())
    )
  }

  return (
    <Navbar {...NavBarProps}>
      <NavbarContent className="gap-1 max-sm:!flex-grow-0">
        <Link href={PageRoutes.INDEX} target="_blank">
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" priority />
        </Link>
        <Link isBlock href={PageRoutes.User.INDEX} color="foreground">
          {user.name || 'User'}
        </Link>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-0">
        {showSearchInput() && <SearchInput className="mr-4 w-72" />}
        <ReButton {...IconButtonProps} href={PageRoutes.User.INDEX}>
          <span className={IconNames.Huge.HOME} />
        </ReButton>
        {LinkGroups.map((group) => (
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
          href={PageRoutes.User.RANDOM}
          tooltip="随便看看"
          startContent={<span className={IconNames.SIEVE} />}
        />
        <ThemeToggle />
        <NavUser />
      </NavbarContent>
    </Navbar>
  )
}
