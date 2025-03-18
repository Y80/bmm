import { UserBookmarkController, UserTagController } from '@/controllers'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import UserHomeBody from '../../components/UserHomeBody'

export const generateMetadata: GenerateMetadata<{ slug: string }> = (props) => {
  const tag = decodeURIComponent(props.params.slug)
  return { title: tag + '相关的书签' }
}

export default async function Page(props: RSCPageProps) {
  const tagNames = decodeURIComponent(props.params.slug).split('+')
  const tags = await UserTagController.getAll()
  const tagIds: TagId[] = []
  tagNames.forEach((tagName) => {
    const tag = tags.find((tag) => tag.name === tagName)
    tag && tagIds.push(tag.id)
  })
  if (!tagIds.length) return <UserHomeBody bookmarks={[]} />
  const params: typeof findManyBookmarksSchema._input = { tagIds, limit: 999 }
  const res = await UserBookmarkController.findMany(findManyBookmarksSchema.parse(params))
  return <UserHomeBody bookmarks={res.list} />
}
