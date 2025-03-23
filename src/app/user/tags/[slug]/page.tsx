import { UserBookmarkController } from '@/controllers'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import UserHomeBody from '../../components/UserHomeBody'

export const generateMetadata: GenerateMetadata<{ slug: string }> = (props) => {
  const tag = decodeURIComponent(props.params.slug)
  return { title: tag + '相关的书签' }
}

export default async function Page(props: RSCPageProps) {
  const tagNames = decodeURIComponent(props.params.slug).split('+')
  const params: typeof findManyBookmarksSchema._input = { tagNames }
  const res = await UserBookmarkController.findMany(findManyBookmarksSchema.parse(params))
  return <UserHomeBody searchedTotalBookmarks={res.total} bookmarks={res.list} />
}
