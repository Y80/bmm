import { ref } from 'vue'

export default function useImgLoad(src: string) {
  const state = ref({
    finished: false,
    loaded: false,
  })
  const img = document.createElement('img')
  img.src = src
  img.onload = () => {
    state.value.finished = true
    state.value.loaded = true
  }
  img.onerror = () => {
    state.value.finished = true
    state.value.loaded = false
  }

  return state.value
}
