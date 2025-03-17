import ReButton from '@/components/re-export/ReButton'
import { IconNames, PageRoutes } from '@cfg'
import { addToast, cn } from '@heroui/react'
import { signOut, useSession } from 'next-auth/react'
import { NavIconOnlyButtonProps } from './Nav'

export default function AdminUser(props: { className?: string }) {
  const session = useSession()

  function handleSignOut() {
    signOut()
    addToast({ title: '已退出登录' })
  }

  const isAuthenticated = session.status === 'authenticated'

  return (
    <ReButton
      {...NavIconOnlyButtonProps}
      className={cn(NavIconOnlyButtonProps.className, props.className)}
      href={isAuthenticated ? PageRoutes.Admin.INDEX : PageRoutes.LOGIN}
      tooltip={{
        placement: 'bottom-end',
        content: isAuthenticated ? (
          <div>
            前往后台管理，或{' '}
            <span className="cursor-pointer text-primary-500" onClick={handleSignOut}>
              退出登录
            </span>
          </div>
        ) : (
          '管理员登录'
        ),
      }}
    >
      <span className={isAuthenticated ? 'icon-[tabler--user-check]' : IconNames.USER} />
    </ReButton>
  )
}
