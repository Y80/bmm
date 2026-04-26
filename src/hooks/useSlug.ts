import { useParams } from 'next/navigation'

export function parseSlug(slug?: string) {
  if (slug === 'new') {
    return {
      isNew: true,
      number: null,
    }
  }

  const number = Number(slug)
  if (slug && Number.isInteger(number)) {
    return {
      isNew: false,
      number,
    }
  }

  throw new Error('无效的页面参数')
}

export default function useSlug() {
  const { slug } = useParams<{ slug?: string }>()

  return parseSlug(slug)
}
