'use client'

import { useIsClient, usePageUtil } from '@/hooks'
import { Assets, PageRoutes } from '@cfg'
import { Divider } from '@heroui/react'
import { useSetState } from 'ahooks'
import Image from 'next/image'
import { useParams, usePathname } from 'next/navigation'
import { useEffect, useMemo } from 'react'
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
      .map((tagName) => props.tags.find((tag) => tag.name === tagName))
      .filter(Boolean) as SelectTag[]
    setState({ selectedTags })
  }, [params.slug, props.tags, setState])

  const bookmarks = state.bookmarks
  const isSearchPage = pathname === (isUserSpace ? PageRoutes.User : PageRoutes.Public).SEARCH
  const isHomePage = pathname === (isUserSpace ? PageRoutes.User : PageRoutes.Public).INDEX

  const homeBodyCtx = useMemo<HomeBodyContext>(() => {
    return {
      tags: props.tags,
      bookmarks: state.bookmarks,
    }
  }, [props.tags, state.bookmarks])

  const showEnd = isClient && !!bookmarks.length && (isHomePage ? state.hasMore === false : true)

  return (
    <HomeBodyProvider value={homeBodyCtx}>
      <aside className="fixed bottom-0 top-16 w-56 pl-6 max-xs:hidden">
        <TagPicker />
      </aside>
      <div className="xs:ml-56">
        <div className="flex flex-col px-6 pb-14">
          <Banner tags={props.tags} totalBookmarks={props.totalBookmarks} />
          <BookmarkContainer>
            {bookmarks.map((bookmark) => {
              return <BookmarkCard {...bookmark} key={bookmark.id} />
            })}
          </BookmarkContainer>
          {!bookmarks.length && isClient && state.hasMore !== true && (
            <div className="grow flex-col flex-center">
              <Image width={128} height={128} src={Assets.BOX_EMPTY_PNG} alt="empty" priority />
              <p className="mt-4 text-sm text-foreground-500">
                {isSearchPage ? '要不，换个关键词再试试？' : '暂无相关内容'}
              </p>
            </div>
          )}
          {showEnd && (
            <div className="mt-12 flex-center">
              <Divider orientation="vertical" className="h-3" />
              <span className="mx-4 text-xs text-foreground-400 xs:mx-8">END</span>
              <Divider orientation="vertical" className="h-3" />
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
