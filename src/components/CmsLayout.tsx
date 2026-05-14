import CmsSidebarNav from '@/components/CmsSidebarNav'
import { ADMIN_NAV_LINKS, PageRoutes, USER_CMS_NAV_LINKS } from '@cfg'
import { cn } from '@heroui/react'
import { PropsWithChildren } from 'react'

type CmsMode = 'admin' | 'user'

interface CmsLayoutProps extends PropsWithChildren {
  mode: CmsMode
}

// CMS 背景样式配置
const cmsBackground = {
  admin: 'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_34%),linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.08),transparent_34%),linear-gradient(135deg,rgba(3,7,18,0.98),rgba(15,23,42,0.96))]',
  user: 'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_34%),linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.08),transparent_34%),linear-gradient(135deg,rgba(3,7,18,0.98),rgba(15,23,42,0.96))]',
} as const

/**
 * CmsLayout - CMS 统一布局组件
 *
 * 封装 admin 和 user 端共用布局结构：
 * - 背景渐变样式
 * - 侧边栏导航（CmsSidebarNav）
 * - 主内容区域
 *
 * 服务端组件，供 admin/layout.tsx 和 user/layout.tsx 使用
 */
export default function CmsLayout(props: CmsLayoutProps) {
  const { mode, children } = props

  const links = mode === 'admin' ? ADMIN_NAV_LINKS : USER_CMS_NAV_LINKS
  const brandHref = mode === 'admin' ? PageRoutes.Admin.INDEX : PageRoutes.User.INDEX

  return (
    <div className={cn('min-h-screen', cmsBackground[mode])}>
      <div className="flex min-h-screen gap-4">
        <CmsSidebarNav
          links={links}
          brandHref={brandHref}
          mode={mode}
          brandTitle={mode === 'admin' ? '网站内容管理' : undefined}
        />
        <main className="min-w-0 flex-1 py-4 pr-4">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
