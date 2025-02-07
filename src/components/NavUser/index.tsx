'use client'

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Link,
} from '@heroui/react'
import { useSetState } from 'ahooks'
import clsx from 'clsx'
import { signOut, useSession } from 'next-auth/react'
import LoginModal from '../LoginModal'

export default function NavUser() {
  const [state, setState] = useSetState({ isOpen: false })
  const session = useSession()

  const user = session.data?.user

  if (!user) {
    return (
      <>
        <Button
          color="primary"
          className="group bg-gradient-to-tl from-indigo-600/70 to-rose-600 !transition-all hover:saturate-150"
          onClick={() => setState({ isOpen: true })}
          startContent={
            <span className="icon-[tabler--user-filled] text-xl transition-all group-hover:icon-[tabler--user]" />
          }
        >
          登 录
        </Button>
        <LoginModal isOpen={state.isOpen} onClose={() => setState({ isOpen: false })} />
      </>
    )
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Avatar isBordered src={user.image!} className="cursor-pointer" />
      </DropdownTrigger>
      <DropdownMenu aria-label="user menu action">
        <DropdownItem key="" showDivider textValue="info">
          <span>{user.name}</span>
        </DropdownItem>
        <DropdownItem key="" textValue="settings">
          <Link href="/user" color="foreground" className="w-full">
            个人中心
          </Link>
        </DropdownItem>
        <DropdownItem
          key=""
          showDivider
          textValue="admin"
          className={clsx(!user.isAdmin && 'hidden')}
        >
          <Link href="/admin" isExternal showAnchorIcon color="foreground" className="w-full">
            后台管理
          </Link>
        </DropdownItem>

        <DropdownItem key="" textValue="logout">
          <Link color="danger" className="w-full" onClick={() => signOut({ callbackUrl: '/' })}>
            退出登录
          </Link>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
