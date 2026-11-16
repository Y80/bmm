'use client'

import { ReButton } from '@/components/re-export'
import { Assets, IconNames, PageRoutes } from '@cfg'
import { cn, Link } from '@heroui/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { usePublicContext } from '../ctx'

export default function Page() {
  const session = useSession()
  const { totalBookmarks } = usePublicContext()

  return (
    <div className="flex-center mx-auto max-w-xl flex-col gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">收藏与整理常用网站</h1>
      {!totalBookmarks && (
        <>
          <Image src={Assets.BOX_EMPTY_PNG} alt="empty" width={128} height={128} />
          <span className="text-foreground-500 text-xs">暂无数据</span>
        </>
      )}
      {session.status === 'authenticated' ? (
        <>
          <ReButton color="primary" href={PageRoutes.User.bookmarkSlug('new')}>
            新建个人书签
          </ReButton>
          <span hidden={!session.data.user.isAdmin}>
            您可前往
            <Link className="mx-1" href={PageRoutes.Admin.INDEX}>
              后台管理
            </Link>
            添加公共书签
          </span>
          <span className="-my-2 text-sm" hidden={!session.data.user.isAdmin}>
            或
          </span>
          <span>
            前往
            <Link className="mx-1" href={PageRoutes.User.INDEX}>
              个人空间
            </Link>
            添加您的个人书签
          </span>
        </>
      ) : (
        <ReButton
          href={PageRoutes.LOGIN}
          className="w-56"
          color="primary"
          startContent={<span className={cn(IconNames.Tabler.USER, 'text-base')} />}
        >
          登录后继续
        </ReButton>
      )}
    </div>
  )
}
