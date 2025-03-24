import { TagPickerBox } from '@/components/common'
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
    if (Array.isArray(params.slug)) return
    const slug = decodeURIComponent(params.slug)
    const selectedTags = slug
      .split('+')
      .map((tagName) => tags.find((tag) => tag.name === tagName))
      .filter(Boolean) as SelectTag[]
    setSelectedTags(selectedTags)
  }, [params.slug, tags])

  const onClickTag = useCallback<OnClickTag>(
    ({ tag, isIntersected, event }) => {
      function toNewPath(tagNames: string[]) {
        const newPath = (isUserSpace ? PageRoutes.User : PageRoutes.Public).tags(tagNames)
        router.push(newPath)
      }
      const tagNames = selectedTags.map((t) => t.name)
      if (tagNames.includes(tag.name)) {
        const newTagNames = tagNames.filter((name) => name !== tag.name)
        toNewPath(newTagNames)
        return
      }
      TagPickerBox.saveScrollTop()
      // 是否执行标签的交叉搜索
      isIntersected ||= event?.altKey
      const finalTagNames = isIntersected ? [...tagNames, tag.name] : [tag.name]
      toNewPath(finalTagNames)
    },
    [isUserSpace, router, selectedTags]
  )

  return { selectedTags, onClickTag }
}
