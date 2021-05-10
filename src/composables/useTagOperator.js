import { inject, ref, reactive } from 'vue'

export default function useTagOperator() {
  const axios = inject('axios')
  const tagList = ref([])

  const getAllTags = async () => {
    tagList.value = await axios.get(`/tag`)
    return tagList.value
  }

  const createTag = async (payload) => {
    await axios.post('/tag', payload)
    getAllTags()
  }

  const updateTag = async (payload) => {
    await axios.put('/tag', payload)
    getAllTags()
  }

  const deleteTag = async (id) => {
    await axios.delete(`/tag/${id}`)
    await getAllTags()
  }

  return { tagList, getAllTags, createTag, updateTag, deleteTag }
}
