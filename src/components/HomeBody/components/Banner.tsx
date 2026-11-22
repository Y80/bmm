import { HOME_CONTENT_LIGHT_BACKGROUND_CLS } from '@/components/HomeBody/styles'
import { usePageUtil } from '@/hooks'
import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Chip, Kbd } from '@heroui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { PropsWithChildren } from 'react'

function Wrapper(props: PropsWithChildren) {
  return <header className="flex-center flex-col gap-4 py-8">{props.children}</header>
}

const H1_CLS = 'text-3xl font-bold flex-center text-foreground-700'
const TAG_CHIP_CLS =
  'text-foreground-600 hover:text-foreground-800 h-auto min-h-7 max-w-full cursor-pointer border border-slate-200/60 bg-white/52 dark:border-neutral-700 dark:bg-neutral-900'
const TAG_CHIP_CLASS_NAMES = { content: 'whitespace-normal wrap-anywhere' }

interface BannerCardProps extends PropsWithChildren {
  title: string
  description: string
}

function BannerCard({ title, description, children }: BannerCardProps) {
  return (
    <header className="pt-[calc(1.125rem-0.5px)] pb-5 sm:pt-[calc(1.5rem-0.5px)] sm:pb-6">
      <div
        className={`rounded-[28px] border border-neutral-200/65 px-4 py-4 text-center backdrop-blur-md sm:px-6 sm:py-5 dark:border-neutral-800 dark:bg-[#141414] dark:backdrop-filter-none ${HOME_CONTENT_LIGHT_BACKGROUND_CLS}`}
      >
        <h1 className="text-foreground text-4xl leading-tight font-bold wrap-anywhere sm:text-5xl">
          {title}
        </h1>
        <p className="text-default-700 mx-auto mt-2 max-w-2xl text-base leading-7 wrap-anywhere text-balance">
          {description}
        </p>
        {children}
      </div>
    </header>
  )
}

interface Props {
  tags: SelectTag[]
  totalBookmarks: number
  searchedTotalBookmarks?: number
  recentUpdatedAt?: Date | null
}

export default function Banner(props: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const pageUtil = usePageUtil()
  const searchParams = useSearchParams()
  const { tags } = props
  const { selectedTags, onClickTag } = useOnClickTag({ tags })
  const routes = pageUtil.isUserSpace ? PageRoutes.User : PageRoutes.Public
  const isHomeLikePage =
    pathname === routes.INDEX || (pageUtil.isUserSpace && pathname === PageRoutes.User.SPACE)

  if (isHomeLikePage) {
    const title = pageUtil.isUserSpace ? '个人空间' : WEBSITE_NAME
    const description = pageUtil.isUserSpace
      ? '整理你的常用网站与标签，保持收藏结构清晰。'
      : '收纳、分享、探索优质网站，持续沉淀高价值链接。'
    const recentUpdatedAt = props.recentUpdatedAt
    const recentUpdatedText = recentUpdatedAt
      ? new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).format(recentUpdatedAt)
      : '暂无记录'

    return (
      <BannerCard title={title} description={description}>
        <ul className="text-default-600 mt-4 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-1 text-sm leading-5 tabular-nums">
          <li>
            书签 <strong className="text-foreground font-semibold">{props.totalBookmarks}</strong>
          </li>
          <li>
            标签 <strong className="text-foreground font-semibold">{tags.length}</strong>
          </li>
          <li className="text-xs">最近更新 {recentUpdatedText}</li>
        </ul>
      </BannerCard>
    )
  }

  if (pathname.startsWith(routes.tags()) && selectedTags.length) {
    const isIntersected = selectedTags.length > 1
    const selectedTagIds = new Set(selectedTags.map((t) => t.id))
    const relatedTagIds = [
      ...new Set(selectedTags.flatMap((t) => t.relatedTagIds).filter((id) => !selectedTagIds.has(id))),
    ]
    const relatedTags = relatedTagIds.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as SelectTag[]

    return (
      <BannerCard
        title={isIntersected ? '标签交叉筛选' : selectedTags[0].name}
        description={
          isIntersected ? '浏览同时匹配所选标签的书签。' : '浏览此标签下的书签和关联标签。'
        }
      >
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <ul aria-label="已选标签" className="flex max-w-full flex-wrap justify-center gap-2">
            {selectedTags.map((tag) => (
              <li key={tag.id} className="max-w-full">
                <Chip
                  variant="flat"
                  className={TAG_CHIP_CLS}
                  classNames={TAG_CHIP_CLASS_NAMES}
                  onClose={() => {
                    const tagNames = selectedTags
                      .filter((item) => item.id !== tag.id)
                      .map((item) => item.name)
                    router.push(routes.tags(tagNames))
                  }}
                >
                  {tag.name}
                </Chip>
              </li>
            ))}
          </ul>
          <p className="text-default-600 text-sm tabular-nums">
            书签{' '}
            <strong className="text-foreground font-semibold">
              {props.searchedTotalBookmarks ?? 0}
            </strong>
          </p>
        </div>

        {relatedTags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-default-600 text-xs">关联标签</span>
              {relatedTags.map((tag) => (
                <Chip
                  key={tag.id}
                  variant="flat"
                  className={TAG_CHIP_CLS}
                  classNames={TAG_CHIP_CLASS_NAMES}
                  as="a"
                  {...getTagLinkAttrs(tag)}
                  href={routes.tags([tag.name])}
                  onClick={(event) => onClickTag({ tag, event })}
                >
                  {tag.name}
                </Chip>
              ))}
            </div>
            <p className="text-default-600 mt-2 text-xs leading-5">
              按住 <Kbd className="scale-75" keys={['alt']} /> 点击标签可交叉筛选书签
            </p>
          </div>
        )}
      </BannerCard>
    )
  }

  if (pathname === routes.RANDOM) {
    return (
      <Wrapper>
        <h1 className={H1_CLS}>随便看看</h1>
        <div className="flex-center text-sm text-zinc-400">探索随机网站，发现精彩内容</div>
      </Wrapper>
    )
  }

  if (pathname.startsWith(routes.SEARCH)) {
    const keyword = searchParams.get('keyword')
    return (
      <BannerCard
        title="搜索结果"
        description={keyword ? `关键词「${keyword}」` : '未输入关键词'}
      >
        <p className="text-default-600 mt-4 text-sm tabular-nums">
          命中书签{' '}
          <strong className="text-foreground font-semibold">
            {props.searchedTotalBookmarks ?? 0}
          </strong>
        </p>
        {!props.searchedTotalBookmarks && (
          <p className="text-default-600 mt-2 text-xs leading-5">
            可尝试更短的关键词，或按网站名称、拼音和简介搜索。
          </p>
        )}
      </BannerCard>
    )
  }

  return null
}
