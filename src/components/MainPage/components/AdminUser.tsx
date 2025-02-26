import ReButton from '@/components/re-export/ReButton'
import { IconNames, PageRoutes } from '@cfg'
import { useMount } from 'ahooks'
import clsx from 'clsx'
import { signOut, useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { NavIconOnlyButtonProps } from './Nav'

export default function AdminUser(props: { className?: string }) {
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

  return (
    <ReButton
      {...NavIconOnlyButtonProps}
      className={clsx(NavIconOnlyButtonProps.className, props.className)}
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
