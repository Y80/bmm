import store from '@/libs/store'

/**
 * 找到与传入的 tag 关联的 bookmark
 * @param {Tag} tag
 * @returns Bookmarks[]
 */
export default function useFindLinkedBookmark(tag) {
  const db = store.state.database
  const bookmarks = []

  Object.values(db.bookmarks).forEach((bookmark) => {
    if (bookmark.tagIdList.includes(tag.id)) {
      bookmarks.push(bookmark)
    }
  })

  return {
    tip: `【${tag.name}】关联的书签`,
    bookmarks,
  }
}
