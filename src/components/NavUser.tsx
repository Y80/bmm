import ReButton from '@/components/re-export/ReButton'
import { IconNames, PageRoutes } from '@cfg'
import { Avatar, Divider, Listbox, ListboxItem, ListboxSection, addToast, cn } from '@heroui/react'
import { signOut, useSession } from 'next-auth/react'
import { IconButtonProps } from './common'

const MENU_ITEM_ICON_CLS = 'text-base translate-y-0.5'

export function NavUser() {
  const session = useSession()
  const user = session.data?.user
  const isAuthenticated = session.status === 'authenticated'

  function handleSignOut() {
    signOut({ redirectTo: PageRoutes.INDEX })
    addToast({ title: '已退出登录' })
  }

  if (!isAuthenticated || !user) {
    return (
      <ReButton
        {...IconButtonProps}
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
      {...IconButtonProps}
      className={cn(IconButtonProps.className, 'hover:bg-transparent dark:hover:bg-transparent')}
      tooltip={{
        adaptMobile: true,
        placement: 'bottom-end',
        content: (
          <Listbox
            aria-label="user"
            itemClasses={{ base: 'pr-4' }}
            topContent={
              <div>
                <div className="flex-items-center mt-2 gap-2">
                  <Avatar size="sm" src={user.image!} showFallback />
                  <span className="text-foreground-500 translate-y-0.5">{user.name}</span>
                </div>
                <Divider className="mt-4 mb-2" />
              </div>
            }
          >
            <ListboxSection showDivider>
              <ListboxItem
                href={PageRoutes.User.SPACE}
                startContent={<span className={cn(IconNames.Tabler.USER, MENU_ITEM_ICON_CLS)} />}
              >
                个人空间
              </ListboxItem>
              <ListboxItem
                href={PageRoutes.User.INDEX}
                target="_blank"
                startContent={
                  <span className={cn(IconNames.Tabler.DASHBOARD, MENU_ITEM_ICON_CLS)} />
                }
              >
                <span className="flex w-full items-center justify-between gap-6">
                  <span>内容管理</span>
                  <span className={cn(IconNames.Tabler.EXTERNAL_LINK, 'text-default-400 text-sm')} />
                </span>
              </ListboxItem>
            </ListboxSection>
            <ListboxSection showDivider hidden={!user.isAdmin} className="max-xs:hidden">
              <ListboxItem
                href={PageRoutes.Admin.INDEX}
                target="_blank"
                startContent={
                  <span className={cn(IconNames.Tabler.SHIELD_LOCK, MENU_ITEM_ICON_CLS)} />
                }
              >
                <span className="flex w-full items-center justify-between gap-6">
                  <span>管理员后台</span>
                  <span className={cn(IconNames.Tabler.EXTERNAL_LINK, 'text-default-400 text-sm')} />
                </span>
              </ListboxItem>
            </ListboxSection>
            <ListboxItem
              onPress={handleSignOut}
              color="danger"
              startContent={<span className={cn(IconNames.Tabler.LOGOUT, MENU_ITEM_ICON_CLS)} />}
            >
              退出登录
            </ListboxItem>
          </Listbox>
        ),
      }}
    >
      <Avatar
        size="sm"
        src={user.image ?? undefined}
        name={user.name || user.email!}
        showFallback
      />
    </ReButton>
  )
}
