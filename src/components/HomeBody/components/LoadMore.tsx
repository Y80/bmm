'use client'

import { actFindPublicBookmarks, actFindUserBookmarks } from '@/actions'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { useIsClient, usePageUtil } from '@/hooks'
import { runAction } from '@/utils'
import { PageRoutes } from '@cfg'
import { Spinner } from '@heroui/react'
import { useRequest, useSetState } from 'ahooks'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

interface Props {
  onChange: (newData: SelectBookmark[], hasMore: boolean) => void
}

/**
 * 通过分页，自动加载更多数据
 *
 * 该组件在以下页面生效：首页、标签筛选页、搜索页
 */

export default function LoadMore(props: Props) {
  const pathname = usePathname()
  const params = useParams<{ slug?: string }>()
  const searchParams = useSearchParams()
  const isClient = useIsClient()
  const pageUtil = usePageUtil()
  const routes = pageUtil.isUserSpace ? PageRoutes.User : PageRoutes.Public
  const enabled =
    isClient &&
    (pathname === routes.INDEX || pathname === routes.SEARCH || pathname.startsWith(routes.tags()))
  const [state, setState] = useSetState({
    page: 2, // page=1 的数据在 RSC 中获取
    hasMore: true,
    isIntersecting: false,
  })

  const { run } = useRequest(async () => {
    if (!enabled) {
      props.onChange([], false)
      return
    }
    const tagNames =
      pathname.startsWith(routes.tags()) && params.slug
        ? decodeURIComponent(params.slug).split('+')
        : undefined
    const keyword = searchParams.get('keyword') || undefined
    const payload: typeof findManyBookmarksSchema._input = { page: state.page, tagNames, keyword }
    const action = pageUtil.isUserSpace ? actFindUserBookmarks : actFindPublicBookmarks
    const { ok, data } = await runAction(action(findManyBookmarksSchema.parse(payload)))
    if (!ok) return
    props.onChange(data.list, data.hasMore)
    setState({ hasMore: data.hasMore, page: state.page + 1 })
  })

  const rootRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setState({ isIntersecting: entry.isIntersecting })
    })
    if (rootRef.current) {
      observer.observe(rootRef.current)
    }
    return () => observer.disconnect()
  }, [setState])

  useEffect(() => {
    enabled && state.isIntersecting && state.hasMore && run()
  }, [state.isIntersecting, state.hasMore, run, enabled])

  return (
    <div ref={rootRef} className={enabled ? 'flex-center' : 'hidden'}>
      {state.hasMore && <Spinner className="pt-12" color="default" />}
    </div>
  )
}
