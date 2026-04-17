'use client'

import { IconNames } from '@cfg'
import { cn } from '@heroui/react'

interface AdminPageTitleProps {
  title: string
  pathname: string
  icon?: string
}

export function getAdminPageTitleIcon(pathname: string, title: string) {
  if (title.includes('导入') || pathname.includes('/upload')) {
    return IconNames.Tabler.UPLOAD
  }
  if (title.includes('用户') || pathname.includes('/user/list')) {
    return IconNames.Tabler.USER
  }
  if (title.includes('新建')) {
    return IconNames.Huge.ADD_SQUARE
  }
  if (title.includes('标签') || pathname.includes('/tag')) {
    return IconNames.Tabler.TAG
  }
  return IconNames.Tabler.BOOKMARK
}

export default function AdminPageTitle(props: AdminPageTitleProps) {
  const icon = props.icon || getAdminPageTitleIcon(props.pathname, props.title)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="border-divider/70 bg-content1/90 dark:bg-content1/80 relative flex size-14 items-center justify-center rounded-2xl border shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)] dark:shadow-[0_20px_44px_-30px_rgba(0,0,0,0.85)]">
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_60%)]" />
        <span className={cn(icon, 'text-primary-500 relative text-[28px]')} />
      </div>
      <h1 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
        {props.title}
      </h1>
    </div>
  )
}
