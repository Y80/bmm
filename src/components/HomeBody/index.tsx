'use client'

import { useIsClient } from '@/hooks'
import { pageSpace } from '@/utils'
import { Assets, PageRoutes } from '@cfg'
import { Divider } from '@heroui/react'
import { useSetState } from 'ahooks'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import Banner from './components/Banner'
import BookmarkCard from './components/BookmarkCard'
import BookmarkContainer from './components/BookmarkContainer'
import LoadMore from './components/LoadMore'
import TagPicker, { TAG_PICKER_SCROLL_TOP_KEY, getScrollElement } from './components/TagPicker'
import { HomeBodyContext, HomeBodyProvider } from './ctx'

interface Props {
  tags: SelectTag[]
  bookmarks: SelectBookmark[]
  totalBookmarks: number
}

export default function HomeBody(props: Props) {
  const router = useRouter()
  const params = useParams()
  const isClient = useIsClient()
  const isUserSpace = pageSpace('auto').isUser
  const { tags } = props
  const [state, setState] = useSetState({
    bookmarks: props.bookmarks || [],
    selectedTags: [] as SelectTag[],
    hasMore: null as boolean | null,
  })

  useEffect(() => {
    const bookmarks = props.bookmarks.toSorted((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
    setState({ bookmarks })
  }, [props.bookmarks, setState])

  // 根据 slug 更新 selectedTags
  useEffect(() => {
    const slug = decodeURIComponent(params.slug as string)
    const selectedTags = slug
      .split('+')
      .map((tagName) => tags.find((tag) => tag.name === tagName))
      .filter(Boolean) as SelectTag[]
    setState({ selectedTags })
  }, [params.slug, tags, setState])

  /* 4rem 是 var(--navbar-height) 的高度 */
  const contentHeight = 'calc(100vh - 4rem)'

  const bookmarks = state.bookmarks
  const isSearchPage =
    globalThis.location?.pathname ===
    (isUserSpace ? PageRoutes.User.SEARCH : PageRoutes.Public.SEARCH)
  const isHomePage =
    globalThis.location?.pathname === (isUserSpace ? PageRoutes.User.INDEX : PageRoutes.INDEX)

  const homeBodyCtx = useMemo<HomeBodyContext>(() => {
    return {
      tags: props.tags,
      bookmarks: state.bookmarks,
      selectedTags: state.selectedTags,
      setSelectedTags: (tags) => setState({ selectedTags: tags }),
      onClickTag: ({ tag, isIntersected, event }) => {
        const tagNames = state.selectedTags.map((t) => t.name)
        if (tagNames.includes(tag.name)) return
        localStorage.setItem(
          TAG_PICKER_SCROLL_TOP_KEY,
          (getScrollElement()?.scrollTop || 0).toString()
        )
        // 是否执行标签的交叉搜索
        const finalIsIntersected = event?.altKey || isIntersected
        const finalTagNames = finalIsIntersected ? [...tagNames, tag.name] : [tag.name]
        PageRoutes.Public.TAGS
        const newPath = (isUserSpace ? PageRoutes.User : PageRoutes.Public).tags(finalTagNames)
        router.push(newPath)
      },
    }
  }, [props.tags, state.bookmarks, state.selectedTags, setState, router])

  console.log({ bookmarks })
  const showEnd = !!bookmarks.length && (isHomePage ? state.hasMore === false : true)

  return (
    <HomeBodyProvider value={homeBodyCtx}>
      <div className="flex grow max-xs:!max-h-none" style={{ maxHeight: contentHeight }}>
        <aside className="max-h-full w-56 flex-shrink-0 pl-6 max-xs:hidden">
          <TagPicker />
        </aside>
        <div className="flex max-h-full grow flex-col overflow-auto px-6 pb-14">
          <Banner tags={tags} totalBookmarks={props.totalBookmarks} />
          <BookmarkContainer>
            {bookmarks.map((bookmark) => {
              return <BookmarkCard {...bookmark} key={bookmark.id} />
            })}
          </BookmarkContainer>
          {!bookmarks.length && isClient && state.hasMore !== true && (
            <div className="-mt-60 grow flex-col flex-center">
              <Image width={128} height={128} src={Assets.BOX_EMPTY_PNG} alt="empty" priority />
              <p className="mt-4 text-sm text-foreground-500">
                {isSearchPage ? '要不，换个关键词再试试？' : '暂无相关内容'}
              </p>
            </div>
          )}
          {showEnd && (
            <div className="mt-12 flex-center">
              <Divider orientation="vertical" />
              <span className="mx-4 text-xs text-foreground-400 xs:mx-8">END</span>
              <Divider orientation="vertical" />
            </div>
          )}
          {isClient && isHomePage && (
            <LoadMore
              onChange={(newData, hasMore) => {
                const ids = bookmarks.map((item) => item.id)
                setState({
                  bookmarks: bookmarks.concat(newData.filter((item) => !ids.includes(item.id))),
                  hasMore,
                })
              }}
            />
          )}
        </div>
      </div>
    </HomeBodyProvider>
  )
}
