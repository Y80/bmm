'use client'

import { useGlobalContext } from '@/app/ctx'
import { SelectPublicBookmark } from '@/controllers/PublicBookmark.controller'
import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import { Assets, PageRoutes } from '@cfg'
import { Divider } from '@heroui/react'
import { useSetState } from 'ahooks'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import Banner from './components/Banner'
import BookmarkCard from './components/BookmarkCard'
import BookmarkContainer from './components/BookmarkContainer'
import LoadMore from './components/LoadMore'
import Nav from './components/Nav'
import TagPicker, { TAG_PICKER_SCROLL_TOP_KEY, getScrollElement } from './components/TagPicker'
import { MainPageContext, MainPageProvider } from './ctx'

// RSC 传进来的数据
interface Props {
  bookmarks?: SelectPublicBookmark[]
}

export default function MainPage(props: Props) {
  const router = useRouter()
  const params = useParams()

  const { tags } = useGlobalContext()
  const [state, setState] = useSetState({
    bookmarks: props.bookmarks || [],
    selectedTags: [] as SelectPublicTag[],
    loadingMore: false,
  })

  useEffect(() => {
    const bookmarks = props.bookmarks || []
    bookmarks.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return 0
    })
    setState({ bookmarks })
  }, [props.bookmarks, setState])

  useEffect(() => {
    const slug = decodeURIComponent(params.slug as string)
    const selectedTags = slug
      .split('+')
      .map((tagName) => tags.find((tag) => tag.name === tagName))
      .filter(Boolean)
    setState({ selectedTags: selectedTags as SelectPublicTag[] })
  }, [params.slug, tags, setState])

  /* 4rem 是 var(--navbar-height) 的高度 */
  const contentHeight = 'calc(100vh - 4rem)'

  const setSelectedTags = useCallback(
    (tags: SelectPublicTag[]) => setState({ selectedTags: tags }),
    [setState]
  )

  const onClickTag = useCallback<MainPageContext['onClickTag']>(
    ({ tag, isIntersected, event }) => {
      const tagNames = state.selectedTags.map((t) => t.name)
      if (tagNames.includes(tag.name)) return
      const finalIsIntersected = event?.altKey || isIntersected

      localStorage.setItem(
        TAG_PICKER_SCROLL_TOP_KEY,
        (getScrollElement()?.scrollTop || 0).toString()
      )

      const newPath = finalIsIntersected
        ? `/tag/${[...tagNames, tag.name].join('+')}`
        : `/tag/${tag.name}`
      router.push(newPath)
    },
    [state.selectedTags, router]
  )

  const isSearchPage = globalThis.location?.pathname === PageRoutes.Public.SEARCH
  const isHomePage = globalThis.location?.pathname === '/'

  console.log(props.bookmarks, state.bookmarks)

  return (
    <MainPageProvider
      value={{
        bookmarks: state.bookmarks,
        selectedTags: state.selectedTags,
        setSelectedTags,
        onClickTag,
      }}
    >
      <Nav />
      <div className="flex grow max-xs:!max-h-none" style={{ maxHeight: contentHeight }}>
        <aside className="max-h-full w-56 flex-shrink-0 pl-6 max-xs:hidden">
          <TagPicker tags={tags} />
        </aside>
        <div className="flex max-h-full grow flex-col overflow-auto px-6 pb-14">
          <Banner />
          {!state.bookmarks.length && (
            <div className="-mt-60 grow flex-col flex-center">
              <Image width={128} height={128} src={Assets.BOX_EMPTY_PNG} alt="empty" />
              <p className="mt-4 text-sm text-foreground-500">
                {isSearchPage ? '要不，换个关键词再试试？' : '暂无相关内容'}
              </p>
            </div>
          )}
          <BookmarkContainer>
            {state.bookmarks.map((bookmark) => {
              return <BookmarkCard {...bookmark} key={bookmark.id} />
            })}
          </BookmarkContainer>
          {!!state.bookmarks.length && !state.loadingMore && (
            <div className="mt-12 flex-center">
              <Divider orientation="vertical" />
              <span className="mx-4 text-xs text-foreground-400 xs:mx-8">END</span>
              <Divider orientation="vertical" />
            </div>
          )}
          {isHomePage && (
            <LoadMore
              onChange={(bookmarks) => setState({ bookmarks: state.bookmarks.concat(bookmarks) })}
              onLoading={(val) => setState({ loadingMore: val })}
            />
          )}
        </div>
      </div>
    </MainPageProvider>
  )
}
