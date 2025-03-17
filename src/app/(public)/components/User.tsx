import { ReButton } from '@/components'
import { IconNames, PageRoutes } from '@cfg'
import { Avatar, Listbox, ListboxItem, addToast, cn } from '@heroui/react'
import { signOut, useSession } from 'next-auth/react'
import { NavIconOnlyButtonProps } from './Nav'

export default function User() {
  const session = useSession()
  const isAuthenticated = session.status === 'authenticated'

  function handleSignOut() {
    signOut()
    addToast({ title: '已退出登录' })
  }

  if (!isAuthenticated) {
    return (
      <ReButton
        {...NavIconOnlyButtonProps}
        href={PageRoutes.LOGIN}
        tooltip={{
          placement: 'bottom-end',
          content: '用户登录',
        }}
      >
        <span className={IconNames.Tabler.USER} />
      </ReButton>
    )
  }

  return (
    <ReButton
      {...NavIconOnlyButtonProps}
      tooltip={{
        placement: 'bottom-end',
        content: (
          <Listbox aria-label="user" itemClasses={{ base: 'pr-4' }}>
            <ListboxItem
              href={PageRoutes.User.INDEX}
              startContent={<span className={cn(IconNames.Tabler.USER, 'text-lg')} />}
            >
              个人空间
            </ListboxItem>
            {session.data.user.isAdmin ? (
              <ListboxItem
                href={PageRoutes.Admin.INDEX}
                startContent={<span className={cn(IconNames.Tabler.DASHBOARD, 'text-lg')} />}
              >
                后台管理
              </ListboxItem>
            ) : null}
            <ListboxItem
              onPress={handleSignOut}
              color="danger"
              startContent={<span className={cn(IconNames.Tabler.LOGOUT, 'text-lg')} />}
            >
              退出登录
            </ListboxItem>
          </Listbox>
        ),
      }}
    >
      <Avatar size="sm" src={session.data.user.image!} showFallback />
    </ReButton>
  )
}
