import HomeBody from '@/components/HomeBody'
import { PublicBookmarkController, PublicTagController } from '@/controllers'
import Nav from './Nav'

interface Props {
  bookmarks: SelectBookmark[]
}

export default async function CommonIndexPage(props: Props) {
  const [tags, total] = await Promise.all([
    PublicTagController.getAll(),
    PublicBookmarkController.total(),
  ])
  return (
    <>
      <Nav />
      <HomeBody bookmarks={props.bookmarks} tags={tags} totalBookmarks={total} />
    </>
  )
}
