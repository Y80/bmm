import { actFindPublicBookmarks, actFindUserBookmarks } from '@/actions'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { usePageUtil } from '@/hooks'
import { runAction } from '@/utils'
import { Spinner } from '@heroui/react'
import { useMount, useRequest, useSetState } from 'ahooks'
import { useEffect, useRef } from 'react'

interface Props {
  onChange: (newData: SelectBookmark[], hasMore: boolean) => void
}

export default function LoadMore(props: Props) {
  const pageUtil = usePageUtil()
  const [state, setState] = useSetState({
    page: 1,
    hasMore: true,
    isIntersecting: false,
    fetchCount: 0,
  })
  const { run } = useRequest(async () => {
    const params = findManyBookmarksSchema.parse({ page: state.page })
    const action = pageUtil.isUserSpace ? actFindUserBookmarks : actFindPublicBookmarks
    const res = await runAction(action(params))
    if (!res.ok) return
    props.onChange(res.data.list, res.data.hasMore)
    setState({ hasMore: res.data.hasMore, page: state.page + 1, fetchCount: state.fetchCount + 1 })
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
    state.isIntersecting && state.hasMore && run()
  }, [state.isIntersecting, state.hasMore, state.fetchCount, run])

  useMount(() => run())

  return (
    <div ref={rootRef} className="flex-center">
      {state.hasMore && <Spinner className="pt-12" color="default" />}
    </div>
  )
}
