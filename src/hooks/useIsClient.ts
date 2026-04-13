import { useSyncExternalStore } from 'react'

function subscribe() {
  return function unsubscribe() {}
}

export default function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
