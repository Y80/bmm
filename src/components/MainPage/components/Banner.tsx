import { useGlobalContext } from '@/app/ctx'
import GradientText from '@/components/GradientText'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Chip } from '@heroui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { useMainPageContext } from '../ctx'

function Wrapper(props: PropsWithChildren) {
  return <header className="flex-col gap-4 py-8 flex-center xs:pb-16">{props.children}</header>
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
        <GradientText
          className="text-6xl"
          animationSpeed={5}
          colors={['#f86d60', '#9c57f6', '#19b6f5', '#78DDBC', '#E2C66A']}
        >
          {WEBSITE_NAME}
        </GradientText>
        <div className="text-foreground-800">收纳、分享、探索优质网站</div>
        <div className="text-sm text-foreground-500">
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
                className="cursor-pointer text-foreground-500 hover:text-foreground-800"
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
                  className="cursor-pointer text-foreground-500 hover:text-foreground-800 active:opacity-50"
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

  if (pathname === PageRoutes.Public.RANDOM) {
    const lastUpdateTime = bookmarks[0].updatedAt
    return (
      <Wrapper>
        <h1 className={H1_CLS}>随便看看</h1>
        <div className="text-sm text-zinc-400 flex-center">探索随机网站，发现精彩内容</div>
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
          <strong className="italic text-foreground-600 underline underline-offset-4">
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
