import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import PublicHomeBody from '../components/PublicHomeBody'

export const generateMetadata: GenerateMetadata = (props) => {
  return { title: `${props.searchParams.keyword as string}的搜索结果` }
}

export default async function Page(props: RSCPageProps) {
  const keyword = props.searchParams.keyword
  if (!keyword?.length || Array.isArray(keyword)) {
    redirect(PageRoutes.Public.INDEX)
  }
  const payload: typeof findManyBookmarksSchema._input = { keyword }
  const res = await PublicBookmarkController.findMany(findManyBookmarksSchema.parse(payload))

  return <PublicHomeBody bookmarks={res.list} />
}
