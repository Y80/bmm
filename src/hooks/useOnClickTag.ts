import { getScrollElement, TAG_PICKER_SCROLL_TOP_KEY } from '@/components/NavTagPicker'
import { PageRoutes } from '@cfg'
import { useParams, useRouter } from 'next/navigation'
import { MouseEvent, useCallback, useEffect, useState } from 'react'
import usePageUtil from './usePageUtil'

type OnClickTag = (arg: {
  tag: SelectTag
  isIntersected?: boolean
  event?: MouseEvent<HTMLDivElement>
}) => void

export function useOnClickTag({ tags }: { tags: SelectTag[] }) {
  const router = useRouter()
  const params = useParams()
  const isUserSpace = usePageUtil().isUserSpace
  const [selectedTags, setSelectedTags] = useState<SelectTag[]>([])

  // 根据 slug 更新 selectedTags
  useEffect(() => {
    const slug = decodeURIComponent(params.slug as string)
    const selectedTags = slug
      .split('+')
      .map((tagName) => tags.find((tag) => tag.name === tagName))
      .filter(Boolean) as SelectTag[]
    setSelectedTags(selectedTags)
  }, [params.slug, tags])

  const onClickTag = useCallback<OnClickTag>(
    function onClickTag({ tag, isIntersected, event }) {
      const tagNames = selectedTags.map((t) => t.name)
      if (tagNames.includes(tag.name)) return
      localStorage.setItem(
        TAG_PICKER_SCROLL_TOP_KEY,
        (getScrollElement()?.scrollTop || 0).toString()
      )
      // 是否执行标签的交叉搜索
      isIntersected ||= event?.altKey
      const finalTagNames = isIntersected ? [...tagNames, tag.name] : [tag.name]
      const newPath = (isUserSpace ? PageRoutes.User : PageRoutes.Public).tags(finalTagNames)
      router.push(newPath)
    },
    [isUserSpace, router, selectedTags]
  )

  return { selectedTags, onClickTag }
}
