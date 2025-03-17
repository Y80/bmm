'use client'

import { ReButton, ReInput, ThemeToggle } from '@/components'
import { useIsClient } from '@/hooks'
import { Assets, Background, IconNames, PageRoutes } from '@cfg'
import {
  Avatar,
  ButtonProps,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Kbd,
  Link,
  Listbox,
  ListboxItem,
  Navbar,
  NavbarContent,
} from '@heroui/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

const IconButtonProps = {
  isIconOnly: true,
  // variant: 'flat',
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
        href: PageRoutes.User.BOOKMARK_LIST,
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
        href: PageRoutes.User.TAG_LIST,
        icon: IconNames.Huge.LIST,
      },
    ],
  },
]

export default function UserNav() {
  const session = useSession()
  const isClient = useIsClient()
  const user = session?.data?.user!

  if (!user) return null

  return (
    <Navbar maxWidth="full" className={Background.CLASS} isBlurred isBordered>
      <NavbarContent className="gap-1 max-sm:!flex-grow-0">
        <Link href={PageRoutes.INDEX} target="_blank">
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" priority />
        </Link>
        <Link isBlock href={PageRoutes.User.INDEX} color="foreground">
          {user.name || 'User'}
        </Link>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-0">
        <ReInput
          className={'mr-2 w-56'}
          placeholder="搜索书签"
          startContent={<span className={IconNames.Huge.SEARCH} />}
          endContent={<Kbd className="px-3">/</Kbd>}
        />
        <ReButton {...IconButtonProps} href={PageRoutes.User.INDEX} tooltip="主页">
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
        <ThemeToggle />
        <div className="w-2" />
        <Dropdown classNames={{ content: 'min-w-36' }}>
          <DropdownTrigger>
            <Avatar size="sm" as="button" src={user.image!} />
          </DropdownTrigger>
          <DropdownMenu disabledKeys={['profile']}>
            <DropdownItem key="profile" className="text-foreground-500">
              {user.name || user.email}
            </DropdownItem>
            <DropdownItem key="settings" href={PageRoutes.User.INDEX}>
              个人设置
            </DropdownItem>
            <DropdownItem key="import" href={PageRoutes.User.UPLOAD}>
              导入浏览器书签
            </DropdownItem>
            <DropdownItem color="danger" key="signout">
              退出登录
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  )
}
