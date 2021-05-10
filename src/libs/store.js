import { getCurrentInstance } from 'vue'
import { createStore } from 'vuex'
import { getDatabase } from '@/libs/api'
import { useRouter } from 'vue-router'

export default createStore({
  state() {
    return {
      // {[id: string]: {id: string, name: string, hue: number, bookmarkNum: number, bookmarkIdList: string[]}}[]
      tags: null,
      // {[id: string]: {id: string, name: string, icon?: string, url: string, tagIdList: string[]}}[]
      bookmarks: null,
    }
  },

  getters: {
    getBookmarks(state) {
      if (state.bookmarks) {
        return Object.values(state.bookmarks)
      }
      useRouter().push('/loading')
      return []
    },
    getTags(state) {
      if (state.tags) {
        return Object.values(state.tags)
      }
      useRouter().push('/loading')
      return []
    },
    getBookmarksByTagId: (state) => (tagId) => {
      return Object.values(state.bookmarks).filter((bookmarks) =>
        bookmarks.tagIdList.includes(tagId)
      )
    },
    getTagsByIdList: (state) => (idList) => {
      return idList.map((id) => state.tags[id])
    },
  },

  mutations: {
    setTags(state, payload) {
      state.tags = payload
    },

    setBookmarks(state, payload) {
      state.bookmarks = payload
    },
  },
})
