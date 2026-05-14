'use client'

import CmsSidebarNav from '@/components/CmsSidebarNav'
import { PageRoutes, USER_CMS_NAV_LINKS } from '@cfg'
import { cn } from '@heroui/react'
import { PropsWithChildren } from 'react'

// CMS 背景样式（user 模式）
const userCmsBackground =
  'bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.1),transparent_34%),linear-gradient(135deg,rgba(248,250,252,0.96),rgba(241,245,249,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.08),transparent_34%),linear-gradient(135deg,rgba(3,7,18,0.98),rgba(15,23,42,0.96))]'

/**
 * CmsLayoutShell - User CMS 布局壳（客户端组件）
 *
 * 封装 user 端的 CMS 布局，供 UserLayoutShell 使用
 */
export default function CmsLayoutShell(props: PropsWithChildren) {
  return (
    <div className={cn('min-h-screen', userCmsBackground)}>
      <div className="flex min-h-screen gap-4">
        <CmsSidebarNav links={USER_CMS_NAV_LINKS} brandHref={PageRoutes.User.INDEX} mode="user" />
        <main className="min-w-0 flex-1 py-4 pr-4">
          <div className="mx-auto w-full max-w-7xl">{props.children}</div>
        </main>
      </div>
    </div>
  )
}
