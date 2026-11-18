import { usePageUtil } from '@/hooks'
import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Chip, Kbd } from '@heroui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PropsWithChildren, ReactNode } from 'react'

function Wrapper(props: PropsWithChildren) {
  return <header className="flex-center flex-col gap-4 py-8">{props.children}</header>
}

const H1_CLS = 'text-3xl font-bold flex-center text-foreground-700'
const SURFACE_CLS =
  'relative w-full overflow-hidden rounded-[28px] border border-slate-200/65 bg-white/20 backdrop-blur-md dark:border-neutral-800 dark:bg-[#141414] dark:backdrop-filter-none'
const BANNER_GRID_CLS =
  'grid gap-3.5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.95fr)] xl:items-start'
const SUMMARY_GRID_CLS = 'grid grid-cols-2 gap-2.5 xl:grid-cols-1 xl:gap-3'
const INNER_PANEL_CLS =
  'rounded-[22px] border border-slate-200/60 bg-white/16 px-3.5 py-3.5 backdrop-blur-sm dark:border-neutral-800 dark:bg-[#101010] dark:backdrop-filter-none sm:px-4.5'

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
  const { tags, totalBookmarks } = props
  const { selectedTags, onClickTag } = useOnClickTag({ tags })
  const routes = pageUtil.isUserSpace ? PageRoutes.User : PageRoutes.Public
  const isHomeLikePage =
    pathname === routes.INDEX || (pageUtil.isUserSpace && pathname === PageRoutes.User.SPACE)

  function formatRecentUpdatedAt(date?: Date | null) {
    if (!date) return '暂无记录'
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  function renderWideCard(content: ReactNode) {
    return (
      <header className="pt-[calc(1.125rem-0.5px)] pb-3 sm:pt-[calc(1.5rem-0.5px)] sm:pb-4">
        <div className={SURFACE_CLS}>
          <div className="relative px-4 py-4 sm:px-6 sm:py-5">{content}</div>
        </div>
      </header>
    )
  }

  if (isHomeLikePage) {
    const title = pageUtil.isUserSpace ? '个人空间' : WEBSITE_NAME
    const description = pageUtil.isUserSpace
      ? '整理你的常用网站与标签，保持收藏结构清晰。'
      : '收纳、分享、探索优质网站，持续沉淀高价值链接。'
    const recentUpdatedText = formatRecentUpdatedAt(props.recentUpdatedAt)

    return renderWideCard(
      <div className={BANNER_GRID_CLS}>
        <div className="min-w-0">
          <div className="text-default-500 text-[0.68rem] font-semibold tracking-[0.26em] uppercase">
            Bookmark Atlas
          </div>
          <h1 className="mt-3 text-[clamp(2.3rem,6vw,3.3rem)] leading-none font-semibold tracking-[-0.04em]">
            {title}
          </h1>
          <p className="text-default-600 mt-3 max-w-2xl text-[15px] leading-7">{description}</p>
          <div className="text-default-500 mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] sm:text-xs">
            <span>最近更新 {recentUpdatedText}</span>
          </div>
        </div>

        <div className={SUMMARY_GRID_CLS}>
          <div className={INNER_PANEL_CLS}>
            <div className="text-default-500 text-[0.68rem] font-medium tracking-[0.24em] uppercase">
              书签
            </div>
            <div className="mt-2 text-[1.9rem] leading-none font-semibold tracking-tight">
              {totalBookmarks}
            </div>
            <div className="text-default-500 mt-1 text-[11px] sm:text-xs">当前可浏览内容规模</div>
          </div>
          <div className={INNER_PANEL_CLS}>
            <div className="text-default-500 text-[0.68rem] font-medium tracking-[0.24em] uppercase">
              标签
            </div>
            <div className="mt-2 text-[1.9rem] leading-none font-semibold tracking-tight">
              {tags.length}
            </div>
            <div className="text-default-500 mt-1 text-[11px] sm:text-xs">用于筛选与导航归类</div>
          </div>
        </div>
      </div>
    )
  }

  if (pathname.startsWith(routes.tags()) && selectedTags.length) {
    const isIntersected = selectedTags.length > 1
    const selectedTagIds = new Set(selectedTags.map((t) => t.id))
    const relatedTagIds = [
      ...new Set(selectedTags.flatMap((t) => t.relatedTagIds).filter((id) => !selectedTagIds.has(id))),
    ]
    const relatedTags = relatedTagIds.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as SelectTag[]

    return renderWideCard(
      <div className={BANNER_GRID_CLS}>
        <div>
          <div className="text-default-500 text-[0.68rem] font-semibold tracking-[0.26em] uppercase">
            Tag View
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2rem]">
            {isIntersected ? '标签交叉筛选' : selectedTags[0].name}
          </h1>
          <p className="text-default-500 mt-3 text-sm leading-6">
            {isIntersected
              ? '当前结果来自多个标签的交集，适合快速缩小范围。'
              : '围绕当前标签浏览相关书签与关联标签。'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Chip
                key={tag.id}
                variant="flat"
                className="text-foreground-600 hover:text-foreground-800 cursor-pointer border border-slate-200/60 bg-white/52 dark:border-neutral-700 dark:bg-neutral-900"
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
        </div>

        <div className={SUMMARY_GRID_CLS}>
          <div className={INNER_PANEL_CLS}>
            <div className="text-default-500 text-[0.68rem] font-medium tracking-[0.24em] uppercase">
              结果规模
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {props.searchedTotalBookmarks || 0}
            </div>
            <div className="text-default-500 mt-1 text-xs">当前筛选命中的书签数量</div>
          </div>
          <div className={INNER_PANEL_CLS}>
            <div className="text-default-500 text-[0.68rem] font-medium tracking-[0.24em] uppercase">
              关联标签
            </div>
            {relatedTags.length ? (
              <>
                <div className="mt-3 flex flex-wrap gap-2">
                  {relatedTags.map((tag) => (
                    <Chip
                      key={tag.id}
                      variant="flat"
                      className="text-foreground-600 hover:text-foreground-800 cursor-pointer border border-slate-200/60 bg-white/52 active:opacity-50 dark:border-neutral-700 dark:bg-neutral-900"
                      as="a"
                      {...getTagLinkAttrs(tag)}
                      onClick={(e) => onClickTag({ tag, event: e as any })}
                    >
                      {tag.name}
                    </Chip>
                  ))}
                </div>
                <div className="text-default-400 mt-3 text-[11px] leading-4.5">
                  按住 <Kbd className="scale-75 opacity-75" keys={['alt']} /> 点击标签可交叉筛选书签
                </div>
              </>
            ) : (
              <div className="text-default-500 mt-2 text-sm leading-6">
                当前标签暂时没有关联标签。
              </div>
            )}
          </div>
        </div>
      </div>
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
    return renderWideCard(
      <div className={BANNER_GRID_CLS}>
        <div>
          <div className="text-default-500 text-[0.68rem] font-semibold tracking-[0.26em] uppercase">
            Search
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2rem]">搜索结果</h1>
          <p className="text-default-500 mt-3 text-sm leading-6">
            关键词命中名称、拼音和简介，结果会随顶部输入内容自动更新。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip
              variant="flat"
              className="text-foreground-600 border border-slate-200/60 bg-white/52 text-sm font-medium dark:border-neutral-700 dark:bg-neutral-900"
            >
              {keyword || '未输入关键词'}
            </Chip>
          </div>
        </div>

        <div className={SUMMARY_GRID_CLS}>
          <div className={INNER_PANEL_CLS}>
            <div className="text-default-500 text-[0.68rem] font-medium tracking-[0.24em] uppercase">
              命中书签
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {props.searchedTotalBookmarks || 0}
            </div>
            <div className="text-default-500 mt-1 text-xs">
              {props.searchedTotalBookmarks
                ? '已返回当前关键词的相关内容'
                : '没有匹配结果，可继续修改关键词'}
            </div>
          </div>
          <div className={INNER_PANEL_CLS}>
            <div className="text-default-500 text-[0.68rem] font-medium tracking-[0.24em] uppercase">
              搜索提示
            </div>
            <div className="text-default-500 mt-2 text-sm leading-6">
              可尝试更短关键词，或换成标签名、拼音、站点特征词。
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
