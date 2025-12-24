import PublicBookmarkController from '@/controllers/PublicBookmark.controller'
import { findManyBookmarksSchema } from '@/controllers/schemas'
import { PageRoutes } from '@cfg'
import { redirect } from 'next/navigation'
import z from 'zod'
import PublicHomeBody from '../components/PublicHomeBody'

export const generateMetadata: GenerateMetadata = async props => {
  return { title: `${(await props.searchParams).keyword as string}的搜索结果` };
}

export default async function Page(props: RSCPageProps) {
  const keyword = (await props.searchParams).keyword
  if (!keyword?.length || Array.isArray(keyword)) {
    redirect(PageRoutes.Public.INDEX)
  }
  const payload: z.input<typeof findManyBookmarksSchema> = { keyword }
  const res = await PublicBookmarkController.findMany(findManyBookmarksSchema.parse(payload))

  return <PublicHomeBody searchedTotalBookmarks={res.total} bookmarks={res.list} />
}
