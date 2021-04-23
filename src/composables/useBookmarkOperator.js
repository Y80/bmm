import { inject, ref } from 'vue'

export default function () {
  const axios = inject('axios')
  const bookmarkList = ref([])

  const getBookmarkList = async () => {
    bookmarkList.value = await axios.get('/bookmark')
  }

  const deleteBookmark = async (id) => {
    await axios.delete(`/bookmark/${id}`)
    getBookmarkList()
  }

  const addBookmark = async (bookmark) => {
    return await axios.post('/bookmark', bookmark)
  }

  const updateBookmark = async (bookmark) => {
    await axios.put('/bookmark', bookmark)
  }

  return {
    bookmarkList,
    getBookmarkList,
    deleteBookmark,
    addBookmark,
    updateBookmark,
  }
}
