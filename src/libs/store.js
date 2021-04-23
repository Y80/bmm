import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      tags: null,
      bookmarks: null,
    }
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
