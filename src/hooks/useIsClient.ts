import { useLayoutEffect, useState } from 'react'

export default function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useLayoutEffect(() => setIsClient(true), [])

  return isClient
}
