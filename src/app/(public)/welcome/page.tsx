import { ReButton } from '@/components/re-export'
import { auth } from '@/lib/auth'
import { Assets, IconNames, PageRoutes } from '@cfg'
import { cn, Link } from '@heroui/react'
import Image from 'next/image'

export default async function Page() {
  const session = await auth()
  return (
    <div className="-mt-[10vh] h-full flex-col gap-4 flex-center">
      <Image src={Assets.BOX_EMPTY_PNG} alt="empty" width={128} height={128} />
      {session?.user ? (
        <>
          <span className="text-sm text-foreground-500">暂无数据</span>
          <span>
            您可前往
            <Link className="mx-1" href={PageRoutes.Admin.INDEX}>
              后台管理
            </Link>
            添加公共书签
          </span>
          <span>
            或前往
            <Link className="mx-1" href={PageRoutes.User.INDEX}>
              个人空间
            </Link>
            添加您的个人书签
          </span>
        </>
      ) : (
        <>
          <span className="text-sm text-foreground-500">暂无数据，请登录后继续操作</span>
          <ReButton
            href={PageRoutes.LOGIN}
            fullWidth
            className="w-56"
            color="primary"
            startContent={<span className={cn(IconNames.USER, 'text-base')} />}
          >
            登录
          </ReButton>
        </>
      )}
    </div>
  )
}
