import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      tags: null,
      bookmarks: null,
      database: null,
    }
  },

  mutations: {
    setTags(state, payload) {
      state.tags = payload
    },

    setBookmarks(state, payload) {
      state.bookmarks = payload
    },

    setDatabase(state, payload) {
      state.database = payload
    },
  },
})
