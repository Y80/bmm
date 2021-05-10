import axios from './axios'

export async function getDatabase() {
  const data = await axios.get(
    'https://api.github.com/repos/y80/y80.github.io/contents/db/nav.json'
  )

  return JSON.parse(decodeURIComponent(escape(atob(data.content))))
}

/**
 * 登录
 */
export function login() {
  return axios.post('/login')
}

export const bookmark = {
  /**
   * 获取所有书签
   * @returns Bookmark[]
   */
  getAll() {
    return axios.get('/bookmark')
  },

  remove(id) {
    return axios.delete(`/bookmark/${id}`)
  },

  add(payload) {
    return axios.post('/bookmark', payload)
  },

  update(payload) {
    return axios.put('/bookmark', payload)
  },
}

export const tag = {
  /**
   * 获取所有标签
   * @returns Tag[]
   */
  getAll() {
    return axios.get('/tag')
  },

  add(payload) {
    return axios.post('/tag', payload)
  },

  update(payload) {
    return axios.put('/tag', payload)
  },

  remove(id) {
    return axios.delete(`/tag/${id}`)
  },
}

export const link = {
  /**
   * 新增 书签:标签 的 一对一 或 一对多的链接
   * @param {object} payload {bookmarkId, tagId} 或 {bookmarkId, tagIdList}
   */
  add(payload) {
    return axios.post('/link', payload)
  },

  /**
   * 删除链接
   * @param {object} payload
   */
  remove(payload) {
    return axios.delete('link', payload)
  },
}
