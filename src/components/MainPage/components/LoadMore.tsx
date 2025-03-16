import { actFindPublicBookmarks, actFindUserBookmarks } from '@/actions'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { pageSpace, runAction } from '@/utils'
import { Spinner } from '@heroui/react'
import { useRequest, useSetState, useUpdateEffect } from 'ahooks'
import { useEffect, useRef } from 'react'

interface Props {
  onChange: (bookmarks: SelectBookmark[]) => void
  onLoading: (loading: boolean) => void
}

export default function LoadMore(props: Props) {
  // page=1 的数据由 RSC 提供，这里从 page=2 开始
  const [state, setState] = useSetState({ page: 2, hasMore: true, isIntersecting: false })
  const { run } = useRequest(async () => {
    props.onLoading(true)
    const params = findManyBookmarksSchema.parse({ page: state.page })
    const action = pageSpace('auto').isAdmin ? actFindPublicBookmarks : actFindUserBookmarks
    const res = await runAction(action(params))
    props.onLoading(false)
    if (!res.ok) return
    props.onChange(res.data.list)
    setState({ hasMore: res.data.hasMore || false, page: state.page + 1 })
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

  useUpdateEffect(() => {
    state.isIntersecting && state.hasMore && run()
  }, [state.isIntersecting, state.hasMore])

  return (
    <div ref={rootRef} className="flex-center">
      {state.hasMore && <Spinner className="pt-12" color="default" />}
    </div>
  )
}
