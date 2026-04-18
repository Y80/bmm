import { PropsWithChildren, useLayoutEffect, useRef } from 'react'
import { useHomePageContext } from '../ctx'

export default function BookmarkContainer({ children }: PropsWithChildren) {
  const divRef = useRef<HTMLDivElement>(null)
  const { bookmarks } = useHomePageContext()

  useLayoutEffect(() => {
    if (!divRef.current) return
    setTimeout(() => {
      divRef.current!.classList.add('transition-all')
      divRef.current!.classList.add('opacity-100!')
      divRef.current!.classList.add('translate-y-0!')
      divRef.current!.style.translate = '0'
    }, 10)
  }, [bookmarks])

  return (
    <div
      ref={divRef}
      className="xs:gap-8 grid translate-y-16 gap-5 opacity-0 duration-300"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}
    >
      {children}
    </div>
  )
}
