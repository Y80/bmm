import { GradientText } from '@/components'
import { usePageUtil } from '@/hooks'
import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Chip } from '@heroui/react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PropsWithChildren } from 'react'

function Wrapper(props: PropsWithChildren) {
  return <header className="flex-col gap-4 py-8 flex-center">{props.children}</header>
}

const H1_CLS = 'text-3xl font-bold flex-center text-foreground-700'

interface Props {
  tags: SelectTag[]
  totalBookmarks: number
  searchedTotalBookmarks?: number
}

export default function Banner(props: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const pageUtil = usePageUtil()
  const searchParams = useSearchParams()
  const session = useSession()
  const { tags, totalBookmarks } = props
  const { selectedTags, onClickTag } = useOnClickTag({ tags })
  const routes = pageUtil.isUserSpace ? PageRoutes.User : PageRoutes.Public

  if (pathname === routes.INDEX) {
    return (
      <Wrapper>
        <GradientText
          className="text-6xl"
          animationSpeed={5}
          colors={['#f86d60', '#9c57f6', '#19b6f5', '#78DDBC', '#E2C66A']}
        >
          {pageUtil.isUserSpace ? session.data?.user.name : WEBSITE_NAME}
        </GradientText>
        <div className="text-foreground-800">收纳、分享、探索优质网站</div>
        <div className="text-sm text-foreground-500">
          已收录 {totalBookmarks} 个书签，共 {tags.length} 个标签
        </div>
      </Wrapper>
    )
  }

  if (pathname.startsWith(routes.tags()) && selectedTags.length) {
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
                    .filter(Boolean) as SelectTag['name'][]
                  router.push(routes.tags(tagNames))
                }}
              >
                {tag.name}
              </Chip>
            ))}
          </div>
        )}
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {props.searchedTotalBookmarks} 个相关书签
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
                  as="a"
                  {...getTagLinkAttrs(tag)}
                  onClick={(e) => onClickTag({ tag, event: e as any })}
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

  if (pathname === routes.RANDOM) {
    return (
      <Wrapper>
        <h1 className={H1_CLS}>随便看看</h1>
        <div className="text-sm text-zinc-400 flex-center">探索随机网站，发现精彩内容</div>
      </Wrapper>
    )
  }

  if (pathname.startsWith(routes.SEARCH)) {
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
          {props.searchedTotalBookmarks
            ? `已获取 ${props.searchedTotalBookmarks} 个相关书签`
            : '暂无相关书签'}
        </div>
      </Wrapper>
    )
  }

  return null
}
