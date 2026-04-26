'use client'

import { usePathname } from 'next/navigation'
import { PropsWithChildren, ReactNode } from 'react'
import AdminPageTitle from './AdminPageTitle'
import { AdminSurfaceCard } from './AdminPageShell'

interface ListPageLayoutProps extends PropsWithChildren {
  title?: string
  surfaceExtra?: ReactNode
  bodyClassName?: string
}

export default function ListPageLayout(props: ListPageLayoutProps) {
  const pathname = usePathname()
  const pageName = pathname.includes('/bookmark')
    ? '书签'
    : pathname.includes('/tag')
      ? '标签'
      : '用户'
  const isCmsSpace = pathname.startsWith('/admin') || pathname.startsWith('/user')
  const title = props.title || `${pageName}列表`

  if (!isCmsSpace) {
    return (
      <div className="mx-auto w-full max-w-5xl py-16">
        <h1 className="mb-16 text-center text-3xl">{pageName}列表</h1>
        {props.children}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5">
      <AdminPageTitle title={title} pathname={pathname} />

      <AdminSurfaceCard
        extra={props.surfaceExtra}
        bodyClassName={props.bodyClassName || 'p-4 sm:p-5'}
      >
        {props.children}
      </AdminSurfaceCard>
    </div>
  )
}
