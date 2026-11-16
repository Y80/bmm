import { ReButton } from '@/components/re-export'
import { auth } from '@/lib/auth'
import { IconNames, PageRoutes } from '@cfg'
import { cn } from '@heroui/react'

export const metadata = {
  title: '欢迎使用',
}

export default async function Page() {
  const session = await auth()

  return (
    <section className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl items-center px-5 py-12 sm:px-8 sm:py-20">
      <div className="xs:grid-cols-2 xs:items-center xs:gap-12 grid w-full gap-10 sm:gap-20">
        <div>
          <span
            className={cn(IconNames.Tabler.BOOKMARK, 'text-primary mb-6 block text-4xl')}
            aria-hidden="true"
          />
          <h1 className="text-foreground text-3xl leading-tight font-semibold sm:text-4xl">
            欢迎回来，
            <span className="mt-2 block break-words">{session?.user.name || '朋友'}</span>
          </h1>
          <p className="text-default-600 mt-5 text-lg leading-8">收藏好网站，整理好灵感。</p>
          <p className="text-default-500 mt-2 max-w-sm text-sm leading-6">
            保存值得留下的链接，用标签串起兴趣与知识，慢慢建立自己的收藏。
          </p>
        </div>

        <div className="min-w-0">
          <h2 className="text-foreground mb-4 text-base font-medium">开始一次收藏</h2>
          <div className="flex flex-col gap-3">
            <ReButton
              href={PageRoutes.User.bookmarkSlug('new')}
              color="primary"
              className="h-14 w-full justify-start gap-3 px-5 text-base"
              startContent={
                <span className={cn(IconNames.Tabler.PLUS, 'text-xl')} aria-hidden="true" />
              }
            >
              新建书签
            </ReButton>
            <ReButton
              href={PageRoutes.User.tagSlug('new')}
              variant="bordered"
              className="border-divider bg-content1/40 h-12 w-full justify-start gap-3 px-5 text-base"
              startContent={
                <span
                  className={cn(IconNames.Tabler.TAG, 'text-default-500 text-xl')}
                  aria-hidden="true"
                />
              }
            >
              新建标签
            </ReButton>
          </div>
          <nav aria-label="管理收藏" className="mt-3 flex flex-wrap gap-x-4">
            <ReButton
              href={PageRoutes.User.bookmarkSlug('list')}
              variant="light"
              className="text-default-600 min-h-11 px-2"
            >
              查看书签列表
            </ReButton>
            <ReButton
              href={PageRoutes.User.tagSlug('list')}
              variant="light"
              className="text-default-600 min-h-11 px-2"
            >
              管理标签
            </ReButton>
          </nav>

          <div className="border-divider mt-6 border-t pt-6">
            <p className="text-foreground text-sm font-medium">已有浏览器书签？</p>
            <p className="text-default-500 mt-1 text-sm leading-6">
              导入书签文件，把原来的收藏带过来。
            </p>
            <ReButton
              href={PageRoutes.User.UPLOAD}
              variant="light"
              color="primary"
              className="mt-2 min-h-11 justify-start gap-2 px-2"
              startContent={
                <span className={cn(IconNames.Huge.IMPORT, 'text-lg')} aria-hidden="true" />
              }
            >
              导入浏览器书签
            </ReButton>
          </div>
        </div>
      </div>
    </section>
  )
}
