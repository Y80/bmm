import ReButton from '@/components/re-export/ReButton'
import { IconNames, PageRoutes } from '@cfg'
import { Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react'
import { useMount } from 'ahooks'
import clsx from 'clsx'
import { signOut, useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { NavIconOnlyButtonProps } from './Nav'

export default function User(props: { className?: string }) {
  const session = useSession()

  useMount(() => {
    if (session.data?.user && !session.data.user.isAdmin) {
      signOut({ redirect: false })
    }
  })

  function handleSignOut() {
    signOut()
    toast.success('已退出登录')
  }

  const isAuthenticated = session.status === 'authenticated'

  if (!isAuthenticated) {
    return (
      <ReButton
        radius="full"
        className={clsx(
          NavIconOnlyButtonProps.className,
          props.className,
          'min-w-0 px-2',
          'bg-gradient-to-tr from-rose-500 to-yellow-500 text-white shadow-lg'
        )}
        href={PageRoutes.LOGIN}
      >
        <span className={IconNames.USER} />
      </ReButton>
    )
  }

  return (
    <div>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            size="sm"
            as="button"
            className="transition-transform"
            src={session.data.user?.image || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          <DropdownItem key="profile" className="text-foreground-500">
            {session.data.user?.name || session.data.user?.email}
          </DropdownItem>
          <DropdownItem key="home" href={PageRoutes.User.INDEX}>
            我的主页
          </DropdownItem>
          <DropdownItem key="settings">设置</DropdownItem>
          <DropdownItem key="logout" onPress={handleSignOut} color="danger">
            退出登录
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
