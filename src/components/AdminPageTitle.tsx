'use client'

import { IconNames } from '@cfg'
import { Card, CardBody, cn } from '@heroui/react'

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
  if (title.includes('模型') || pathname.includes('/ai-provider')) {
    return IconNames.Tabler.API
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
    <Card
      shadow="none"
      className="border-divider/70 overflow-hidden rounded-[28px] border bg-white/58 shadow-sm shadow-black/[0.03] backdrop-blur-xl dark:bg-content1/62 dark:shadow-black/10"
    >
      <CardBody className="relative overflow-hidden px-5 py-4.5 sm:px-6 sm:py-5">
        <div className="relative flex items-center gap-4">
          <div className="border-divider/70 bg-background/70 dark:bg-default-100/10 relative flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-[0_14px_30px_-24px_rgba(15,23,42,0.55)] dark:shadow-none">
            <span className={cn(icon, 'text-primary-500 relative text-[26px]')} />
          </div>
          <h1 className="min-w-0 truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {props.title}
          </h1>
        </div>
      </CardBody>
    </Card>
  )
}
