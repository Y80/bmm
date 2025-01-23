import { useGlobalContext } from '@/app/ctx'
import { cn } from '@/lib/utils'
import { WEBSITE_NAME } from '@cfg'
import { Chip } from "@heroui/react"
import dayjs from 'dayjs'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { useMainPageContext } from '../ctx'

function Wrapper(props: PropsWithChildren) {
  return <header className="flex-center xs:pb-16 flex-col gap-4 py-8">{props.children}</header>
}

const H1_CLS = 'text-3xl font-bold flex-center text-foreground-700'

export default function Banner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { tags, totalBookmarks } = useGlobalContext()
  const { bookmarks, selectedTags, onClickTag } = useMainPageContext()

  if (pathname === '/') {
    return (
      <Wrapper>
        <h1
          className={cn(
            H1_CLS,
            'mb-4 bg-gradient-to-r from-blue-500 via-purple-500 via-30% to-rose-500 bg-clip-text font-serif text-6xl font-extralight text-transparent'
          )}
        >
          {WEBSITE_NAME}
        </h1>
        <div className="text-foreground-800">收纳、分享、探索优质网站</div>
        <div className="text-foreground-500 text-sm">
          已收录 {totalBookmarks} 个书签，共 {tags.length} 个标签
        </div>
      </Wrapper>
    )
  }

  if (pathname.startsWith('/tag/') && selectedTags.length) {
    const isIntersected = selectedTags.length > 1
    const firstTag = selectedTags[0]
    return (
      <Wrapper>
        <h1 className={H1_CLS}>
          <span> {isIntersected ? '标签交叉筛选' : firstTag.name}</span>
        </h1>
        {isIntersected && (
          <div className="space-x-2">
            {selectedTags.map((tag) => (
              <Chip
                key={tag.id}
                variant="flat"
                className="text-foreground-500 hover:text-foreground-800 cursor-pointer"
                onClose={() => {
                  const tagNames = selectedTags
                    .map((t) => (t.name === tag.name ? null : t.name))
                    .filter(Boolean)
                  router.push('/tag/' + tagNames.join('+'))
                }}
              >
                {tag.name}
              </Chip>
            ))}
          </div>
        )}
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {bookmarks.length} 个相关书签
          {!isIntersected && `，${firstTag.relatedTagIds.length} 个关联标签`}
        </div>
        {!isIntersected && !!firstTag.relatedTagIds.length && (
          <div className="space-x-2">
            {firstTag.relatedTagIds.map((id) => {
              const tag = tags.find((tag) => tag.id === id)!
              return (
                <Chip
                  key={id}
                  variant="flat"
                  className="text-foreground-500 hover:text-foreground-800 cursor-pointer active:opacity-50"
                  onClick={(e) => onClickTag({ tag, event: e })}
                >
                  {tag.name}
                </Chip>
              )
            })}
          </div>
        )}
      </Wrapper>
    )
  }

  if (pathname.startsWith('/recent')) {
    const lastUpdateTime = bookmarks[0].updatedAt
    return (
      <Wrapper>
        <h1 className={H1_CLS}>最近更新</h1>
        <div className="text-sm text-zinc-400">
          {dayjs(lastUpdateTime).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      </Wrapper>
    )
  }

  if (pathname.startsWith('/search')) {
    const keyword = searchParams.get('keyword')
    return (
      <Wrapper>
        <h1 className={H1_CLS}>搜索结果</h1>
        <div className="text-sm text-zinc-400">
          关键词：
          <strong className="text-foreground-600 italic underline underline-offset-4">
            {keyword?.toUpperCase()}
          </strong>
        </div>
        <div className="text-sm text-zinc-400">
          {bookmarks.length ? `已获取 ${bookmarks.length} 个相关书签` : '暂无相关书签'}
        </div>
      </Wrapper>
    )
  }

  return null
}
