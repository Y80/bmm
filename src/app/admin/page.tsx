'use client'

import { ReButton } from '@/components'
import { ADMIN_NAV_LINKS, IconNames, PageRoutes } from '@cfg'
import { cn } from '@heroui/react'
import { useSession } from 'next-auth/react'

export default function Page() {
  const session = useSession()

  return (
    <div className="flex-center -mt-16 h-screen flex-col">
      <div className="relative">
        <span className="from-foreground-200 absolute -z-10 -translate-x-1/2 -translate-y-10 bg-linear-to-b bg-clip-text text-5xl text-transparent">
          WELCOME
        </span>
      </div>
      <h3 className="text-foreground-800 mb-20 text-5xl font-bold">
        👋 欢迎你，管理员{session.data?.user?.name}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {ADMIN_NAV_LINKS.map((link, idx) => (
          <ReButton
            key={link.label}
            href={link.href}
            size="lg"
            className={cn(
              'group relative h-24 w-60 bg-linear-to-br text-xl text-gray-200 transition-all! hover:saturate-150',
              idx === 0 && 'from-rose-500 to-rose-700',
              idx === 1 && 'from-blue-500 to-blue-700',
              idx === 2 && 'from-lime-500 to-lime-700',
              idx === 3 && 'from-purple-500 to-purple-700'
            )}
          >
            <span
              className={cn(
                'text-2xl',
                link.label.includes('书签') ? IconNames.BOOKMARK : IconNames.TAG
              )}
            />
            <span>{link.label}</span>
            <span
              className={cn(
                'absolute top-1 right-1 text-5xl opacity-30 transition group-hover:opacity-80',
                link.label.includes('新建') ? IconNames.PLUS : IconNames.LIST
              )}
            />
          </ReButton>
        ))}
        <ReButton
          href={PageRoutes.Admin.UPLOAD}
          size="lg"
          className="bg-foreground text-background col-span-2 py-7"
        >
          <span className={cn(IconNames.IMPORT, 'text-xl')} />
          <span>导入浏览器书签</span>
        </ReButton>
      </div>
    </div>
  )
}
