'use client'

import { useIsClient, usePageUtil } from '@/hooks'
import { Assets, PageRoutes } from '@cfg'
import { Divider } from '@heroui/react'
import { useSetState } from 'ahooks'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { ReactNode, useEffect, useMemo } from 'react'
import Banner from './components/Banner'
import BookmarkCard from './components/BookmarkCard'
import BookmarkContainer from './components/BookmarkContainer'
import LoadMore from './components/LoadMore'
import TagPicker from './components/TagPicker'
import { HomeBodyContext, HomeBodyProvider } from './ctx'

interface Props {
  tags: SelectTag[]
  bookmarks: SelectBookmark[]
  totalBookmarks: number
  searchedTotalBookmarks?: number
  header?: ReactNode
}

export default function HomeBody(props: Props) {
  const pathname = usePathname()
  const params = useParams()
  const isClient = useIsClient()
  const isUserSpace = usePageUtil().isUserSpace
  const [state, setState] = useSetState({
    bookmarks: props.bookmarks || [],
    selectedTags: [] as SelectTag[],
    hasMore: null as boolean | null,
  })

  useEffect(() => {
    const bookmarks = [...props.bookmarks].sort((a, b) => {
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
      .map((tagName) => props.tags.find((tag) => tag.name === tagName))
      .filter(Boolean) as SelectTag[]
    setState({ selectedTags })
  }, [params.slug, props.tags, setState])

  const bookmarks = state.bookmarks
  const isSearchPage = pathname === (isUserSpace ? PageRoutes.User : PageRoutes.Public).SEARCH

  const homeBodyCtx = useMemo<HomeBodyContext>(() => {
    return {
      tags: props.tags,
      bookmarks: state.bookmarks,
    }
  }, [props.tags, state.bookmarks])
  const recentUpdatedAt = useMemo(() => {
    return [...props.tags, ...props.bookmarks].reduce<Date | null>((latest, item) => {
      const value = item.updatedAt || item.createdAt
      if (!value) return latest
      const date = value instanceof Date ? value : new Date(value)
      if (Number.isNaN(date.getTime())) return latest
      return !latest || date.getTime() > latest.getTime() ? date : latest
    }, null)
  }, [props.bookmarks, props.tags])

  const showEnd = isClient && !!bookmarks.length && state.hasMore === false

  return (
    <HomeBodyProvider value={homeBodyCtx}>
      <aside className="max-xs:hidden fixed top-20 bottom-4 w-60 pl-4">
        <TagPicker />
      </aside>
      <div className="xs:ml-60">
        <div className="xs:px-6 xs:pb-14 flex flex-col px-4 pb-12">
          {props.header}
          <Banner
            tags={props.tags}
            totalBookmarks={props.totalBookmarks}
            searchedTotalBookmarks={props.searchedTotalBookmarks}
            recentUpdatedAt={recentUpdatedAt}
          />
          <BookmarkContainer>
            {bookmarks.map((bookmark) => {
              return <BookmarkCard {...bookmark} key={bookmark.id} />
            })}
          </BookmarkContainer>
          {!bookmarks.length && isClient && !state.hasMore && (
            <div className="flex-center grow flex-col">
              <Image width={128} height={128} src={Assets.BOX_EMPTY_PNG} alt="empty" priority />
              <p className="text-foreground-500 mt-4 text-sm">
                {isSearchPage ? '要不，换个关键词再试试？' : '暂无相关内容'}
              </p>
            </div>
          )}
          {showEnd && (
            <div className="flex-center mt-12">
              <Divider orientation="vertical" className="h-3" />
              <span className="text-foreground-400 xs:mx-8 mx-4 text-xs">END</span>
              <Divider orientation="vertical" className="h-3" />
            </div>
          )}
          <LoadMore
            key={globalThis.location?.href}
            onChange={(newData, hasMore) => {
              const ids = bookmarks.map((item) => item.id)
              setState({
                hasMore,
                bookmarks: bookmarks.concat(newData.filter((item) => !ids.includes(item.id))),
              })
            }}
          />
        </div>
      </div>
    </HomeBodyProvider>
  )
}
