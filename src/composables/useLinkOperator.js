import { inject } from 'vue'

export default function useLinkOperator() {
  const axios = inject('axios')
  /**
   * 创建一个或多个连接
   * @param {Object} params {tagId, bookmarkId} 或 {bookmarkId, tagIdList}
   */
  async function addLinks(params) {
    await axios.post('/link', params)
  }

  async function delLinks(params) {
    await axios.delete('link', params)
  }

  return { addLinks }
}
