import { ReButton } from '@/components'
import { IconNames, PageRoutes } from '@cfg'
import { Avatar, Divider, Listbox, ListboxItem, ListboxSection, addToast, cn } from '@heroui/react'
import { signOut, useSession } from 'next-auth/react'

export function NavUser() {
  const session = useSession()
  const user = session.data?.user
  const isAuthenticated = session.status === 'authenticated'

  function handleSignOut() {
    signOut()
    addToast({ title: '已退出登录' })
  }

  if (!isAuthenticated || !user) {
    return (
      <ReButton
        variant="light"
        isIconOnly
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
      variant="light"
      isIconOnly
      tooltip={{
        placement: 'bottom-end',
        content: (
          <Listbox
            aria-label="user"
            itemClasses={{ base: 'pr-4' }}
            topContent={
              <div>
                <div className="gap-2 flex-items-center">
                  <Avatar size="sm" src={user.image!} showFallback />
                  <span className="translate-y-0.5 text-foreground-500">{user.name}</span>
                </div>
                <Divider className="mb-2 mt-4" />
              </div>
            }
          >
            <ListboxSection showDivider>
              <ListboxItem
                href={PageRoutes.User.INDEX}
                startContent={<span className={cn(IconNames.Tabler.USER, 'text-base')} />}
              >
                个人空间
              </ListboxItem>
              {user.isAdmin ? (
                <ListboxItem
                  href={PageRoutes.Admin.INDEX}
                  startContent={<span className={cn(IconNames.Tabler.DASHBOARD, 'text-base')} />}
                >
                  后台管理
                </ListboxItem>
              ) : null}
            </ListboxSection>
            <ListboxItem
              onPress={handleSignOut}
              color="danger"
              startContent={<span className={cn(IconNames.Tabler.LOGOUT, 'text-base')} />}
            >
              退出登录
            </ListboxItem>
          </Listbox>
        ),
      }}
    >
      <Avatar size="sm" src={user.image!} showFallback />
    </ReButton>
  )
}
