import { createStore } from 'vuex'
import TagAPI from '../api/tag'
import { ITag } from '../interface'

interface State {
  tags: ITag[]
  isMobile: boolean
}

const store = createStore<State>({
  state() {
    return {
      tags: [],
      isMobile: window.innerWidth < 768,
    }
  },

  getters: {},

  mutations: {
    setTags(state, payload) {
      state.tags = payload
    },

    setIsMobile(state, payload) {
      state.isMobile = payload
    },
  },

  actions: {
    async getAllTags({ state }) {
      state.tags = await TagAPI.getAll()

      return state.tags
    },
  },

  modules: {},
})

export default store

window.addEventListener('resize', () => {
  store.commit('setIsMobile', window.innerWidth < 768)
})
