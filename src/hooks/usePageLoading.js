import { ref } from 'vue'

export const isLoading = ref(false)

export function setLoadingState(value) {
  isLoading.value = value
}
