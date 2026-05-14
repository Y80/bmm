'use client'

import { IconNames } from '@cfg'
import { Card, CardBody, cn } from '@heroui/react'

interface AdminPageTitleProps {
  title: string
  pathname: string
  icon?: string
  actions?: React.ReactNode
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
      <CardBody className="relative overflow-hidden px-5 py-3 sm:px-6 sm:py-4">
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="border-divider/70 bg-background/70 dark:bg-default-100/10 relative flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)] dark:shadow-none">
              <span className={cn(icon, 'text-primary-500 relative text-xl')} />
            </div>
            <h1 className="min-w-0 truncate text-xl font-medium tracking-tight text-default-700 sm:text-2xl">
              {props.title}
            </h1>
          </div>
          {props.actions && <div className="flex shrink-0 items-center gap-2">{props.actions}</div>}
        </div>
      </CardBody>
    </Card>
  )
}
