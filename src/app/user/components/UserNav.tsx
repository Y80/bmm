'use client'

import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import ThemeToggle from '@/components/ThemeToggle'
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
  Navbar,
  NavbarContent,
} from '@heroui/react'
import { Session } from 'next-auth'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const User_NAV_LINKS = [
  { label: '新建书签', href: PageRoutes.User.bookmarkSlug('new') },
  { label: '新建标签', href: PageRoutes.User.tagSlug('new') },
  { label: '书签列表', href: PageRoutes.User.BOOKMARK_LIST },
  { label: '标签列表', href: PageRoutes.User.TAG_LIST },
]

interface Props {
  user: NonNullable<Session['user']>
}

const IconButtonProps = {
  isIconOnly: true,
  // variant: 'flat',
  variant: 'light',
  className: 'text-2xl text-foreground-700',
} satisfies ButtonProps

export default function AdminNav(props: Props) {
  const pathname = usePathname()

  return (
    <Navbar maxWidth="full" className={Background.CLASS} isBlurred isBordered>
      <NavbarContent className="gap-1 max-sm:!flex-grow-0">
        <Link href={PageRoutes.INDEX} target="_blank">
          <Image src={Assets.LOGO_SVG} width={32} height={32} alt="logo" priority />
        </Link>
        <Link isBlock href={PageRoutes.User.INDEX} color="foreground">
          {props.user.name || 'User'}
        </Link>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-0">
        <ReInput
          className={'mr-2 w-56'}
          placeholder="搜索书签"
          startContent={<span className={IconNames.Huge.SEARCH} />}
          endContent={<Kbd className="px-3">/</Kbd>}
        />
        <ReButton {...IconButtonProps} href={PageRoutes.User.INDEX} tooltip={{ content: '主页' }}>
          <span className={IconNames.Huge.HOME} />
        </ReButton>
        <Dropdown classNames={{ content: 'min-w-32' }} placement="bottom-start">
          <DropdownTrigger>
            <ReButton {...IconButtonProps} tooltip={{ content: '书签管理' }}>
              <span className={cn(IconNames.Huge.BOOKMARK)} />
            </ReButton>
          </DropdownTrigger>
          <DropdownMenu>
            {[
              {
                label: '新建书签',
                href: PageRoutes.User.bookmarkSlug('new'),
                icon: IconNames.Huge.ADD,
              },
              {
                label: '书签列表',
                href: PageRoutes.User.BOOKMARK_LIST,
                icon: IconNames.Huge.LIST,
              },
            ].map((el) => (
              <DropdownItem
                key={el.label}
                startContent={<span className={cn(el.icon, 'text-base')} />}
              >
                {el.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <Dropdown classNames={{ content: 'min-w-32' }} placement="bottom-start">
          <DropdownTrigger>
            <ReButton {...IconButtonProps} tooltip={{ content: '标签管理' }}>
              <span className={IconNames.Huge.TAG} />
            </ReButton>
          </DropdownTrigger>
          <DropdownMenu>
            {[
              {
                label: '新建标签',
                href: PageRoutes.User.tagSlug('new'),
                icon: IconNames.Huge.ADD,
              },
              {
                label: '标签列表',
                href: PageRoutes.User.TAG_LIST,
                icon: IconNames.Huge.LIST,
              },
            ].map((el) => (
              <DropdownItem
                key={el.label}
                startContent={<span className={cn(el.icon, 'text-base')} />}
              >
                {el.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
        <ThemeToggle />
        <Dropdown classNames={{ content: 'min-w-36' }}>
          <DropdownTrigger>
            <Avatar size="sm" as="button" src={props.user.image!} />
          </DropdownTrigger>
          <DropdownMenu disabledKeys={['profile']}>
            <DropdownItem key="profile" className="text-foreground-500">
              {props.user.name || props.user.email}
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
