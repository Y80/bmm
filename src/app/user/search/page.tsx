import { UserBookmarkController } from '@/controllers'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import UserHomeBody from '../components/UserHomeBody'

export const generateMetadata: GenerateMetadata<{ keyword: string }> = (props) => {
  return { title: `${props.searchParams.keyword}的搜索结果` }
}

export default async function Page(props: RSCPageProps) {
  const keyword = props.searchParams.keyword
  if (!keyword?.length || Array.isArray(keyword)) {
    redirect(PageRoutes.User.INDEX)
  }
  const payload: typeof findManyBookmarksSchema._input = { keyword }
  const res = await UserBookmarkController.findMany(findManyBookmarksSchema.parse(payload))
  return <UserHomeBody searchedTotalBookmarks={res.total} bookmarks={res.list} />
}
