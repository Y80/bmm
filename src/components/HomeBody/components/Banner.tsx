import { usePageUtil } from '@/hooks'
import { useOnClickTag } from '@/hooks/useOnClickTag'
import { getTagLinkAttrs } from '@/utils'
import { PageRoutes, WEBSITE_NAME } from '@cfg'
import { Chip } from '@heroui/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { PropsWithChildren, ReactNode } from 'react'

function Wrapper(props: PropsWithChildren) {
  return <header className="flex-center flex-col gap-4 py-8">{props.children}</header>
}

const H1_CLS = 'text-3xl font-bold flex-center text-foreground-700'
const SURFACE_CLS =
  'border-divider/60 dark:border-white/8 relative w-full overflow-hidden rounded-[28px] border bg-white/84 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.18)] backdrop-blur dark:bg-white/[0.045] dark:shadow-none'
const SURFACE_HIGHLIGHT_CLS =
  'absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%,rgba(56,189,248,0.05))] dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_38%,rgba(34,211,238,0.04))]'
const INNER_PANEL_CLS =
  'border-divider/60 dark:border-white/8 rounded-[22px] border bg-white/52 px-3.5 py-3.5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.12)] dark:bg-white/[0.03] dark:shadow-none sm:px-4.5'

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
      <header className="py-3 sm:py-4">
        <div className={SURFACE_CLS}>
          <div className={SURFACE_HIGHLIGHT_CLS} />
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
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.95fr)] xl:items-start">
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

        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-1 xl:gap-3">
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
    const firstTag = selectedTags[0]
    return renderWideCard(
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)] xl:items-start">
        <div>
          <div className="text-default-500 text-[0.68rem] font-semibold tracking-[0.26em] uppercase">
            Tag View
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-[2rem]">
            {isIntersected ? '标签交叉筛选' : firstTag.name}
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
                className="text-foreground-500 hover:text-foreground-800 cursor-pointer bg-white/60 dark:bg-white/[0.06]"
                onClose={
                  isIntersected
                    ? () => {
                        const tagNames = selectedTags
                          .map((t) => (t.name === tag.name ? null : t.name))
                          .filter(Boolean) as SelectTag['name'][]
                        router.push(routes.tags(tagNames))
                      }
                    : undefined
                }
              >
                {tag.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
              {isIntersected ? '操作提示' : '关联标签'}
            </div>
            {isIntersected ? (
              <div className="text-default-500 mt-2 text-sm leading-6">
                关闭任意标签即可放宽筛选范围，继续探索更广结果。
              </div>
            ) : firstTag.relatedTagIds.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {firstTag.relatedTagIds.map((id) => {
                  const tag = tags.find((tag) => tag.id === id)!
                  return (
                    <Chip
                      key={id}
                      variant="flat"
                      className="text-foreground-500 hover:text-foreground-800 cursor-pointer bg-white/60 active:opacity-50 dark:bg-white/[0.06]"
                      as="a"
                      {...getTagLinkAttrs(tag)}
                      onClick={(e) => onClickTag({ tag, event: e as any })}
                    >
                      {tag.name}
                    </Chip>
                  )
                })}
              </div>
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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)] xl:items-start">
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
              className="text-foreground-600 border-none bg-white/60 text-sm font-medium dark:bg-white/[0.06]"
            >
              {keyword || '未输入关键词'}
            </Chip>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
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
