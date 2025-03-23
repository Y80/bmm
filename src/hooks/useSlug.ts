import { useSetState } from 'ahooks'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function useSlug() {
  const { slug } = useParams<{ slug?: string }>()
  const [state, setState] = useSetState({
    isNew: false,
    number: null as number | null,
  })

  useEffect(() => {
    if (slug === 'new') {
      setState({ isNew: true })
    } else if (Number.isInteger(Number(slug))) {
      setState({ number: Number(slug) })
    } else {
      throw new Error()
    }
  }, [setState, slug])

  return state
}
