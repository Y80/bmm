import { SelectPublicBookmark } from '@/controllers/PublicBookmark.controller'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { findManyBookmarks } from '@/lib/actions'
import { to } from '@/utils'
import { Spinner } from '@heroui/react'
import { useRequest, useSetState, useUpdateEffect } from 'ahooks'
import { useEffect, useRef } from 'react'

interface Props {
  onChange: (bookmarks: SelectPublicBookmark[]) => void
  onLoading: (loading: boolean) => void
}

export default function LoadMore(props: Props) {
  // page=1 的数据由 RSC 提供，这里从 page=2 开始
  const [state, setState] = useSetState({ page: 2, hasMore: true, isIntersecting: false })
  const { run } = useRequest(async () => {
    props.onLoading(true)
    const params = findManyBookmarksSchema.parse({ page: state.page })
    const [err, res] = await to(findManyBookmarks(params))
    props.onLoading(false)
    if (res) {
      props.onChange(res.list)
    }
    setState({ hasMore: res?.hasMore || false, page: state.page + 1 })
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
  }, [rootRef.current])

  useUpdateEffect(() => {
    state.isIntersecting && state.hasMore && run()
  }, [state.isIntersecting, state.hasMore])

  return (
    <div ref={rootRef} className="flex-center">
      {state.hasMore && <Spinner className="pt-12" color="default" />}
    </div>
  )
}
