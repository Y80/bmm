import { usePathname } from 'next/navigation'
import { PropsWithChildren } from 'react'

export default function ListPageLayout(props: PropsWithChildren) {
  const pathname = usePathname()

  return (
    <div className="mx-auto w-full max-w-5xl py-16">
      <h1 className="mb-16 text-center text-3xl">
        {pathname.includes('/tag') ? '标签' : '书签'}列表
      </h1>
      {props.children}
    </div>
  )
}
