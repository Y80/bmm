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
      return Object.values(state.bookmarks).filter((bookmark) =>
        bookmark.tagIdList.includes(tagId)
      )
    },
    getTagsByIdList: (state) => (idList) => {
      return idList.map((id) => state.tags[id])
    },
  },

  mutations: {
    // tag: {id: string, name: string, hue?:number}
    setTags(state, payload) {
      if (payload instanceof Array) {
        const result = {}
        payload.forEach((tag) => {
          result[tag.id] = tag
        })
        state.tags = result
      } else if (payload instanceof Object) {
        state.tags = payload
      } else {
        alert('store setTags 出现错误')
      }
    },

    setBookmarks(state, payload) {
      if (payload instanceof Object) {
        state.bookmarks = payload
      } else if (payload instanceof Array) {
        const result = {}
        payload.forEach((bookmark) => {
          result[bookmark.id] = {
            ...bookmark,
            tagIdList:
              bookmark.tagIdList || bookmark.tagList.map((tag) => tag.id),
          }
        })
        state.bookmarks = result
      } else {
        alert('store setBookmarks 出现错误')
      }
    },
  },
})
