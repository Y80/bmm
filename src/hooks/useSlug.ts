import { useSetState } from 'ahooks'
import { useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function useSlug() {
  const [state, setState] = useSetState({
    isNew: false,
    number: null as null | number,
  })
  const { slug } = useParams<{ slug?: string }>()

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
