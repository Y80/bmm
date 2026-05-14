'use client'

import {
  actDeleteUserTag,
  actDeleteUserTags,
  actFindUserTags,
  actUpdateUserTag,
} from '@/actions'
import { useUserContext } from '@/app/user/ctx'
import TagListPage, { TagListPageProps } from '@/components/TagListPage'
import { runAction } from '@/utils/client'

export default function ClientPage() {
  const { tags, setCtxValue, updateTags } = useUserContext()

  const props: TagListPageProps = {
    allTags: tags,
    refreshAllTags: updateTags,
    findTags: actFindUserTags,
    removeTag: async (tag) => {
      await runAction(actDeleteUserTag({ id: tag.id }), { onOk: () => updateTags() })
    },
    removeTags: async (ids) => {
      await runAction(actDeleteUserTags({ ids }), { onOk: () => updateTags() })
    },
    changeTag: async (tag) => {
      const idx = tags.findIndex((e) => e.id === tag.id)
      if (idx === -1) return
      const nextTags = [...tags]
      nextTags[idx] = tag
      setCtxValue((state) => ({ ...state, tags: nextTags }))
      await runAction(actUpdateUserTag(tag), { onOk: () => updateTags() })
    },
  }

  return <TagListPage {...props} />
}
