import { cn } from '@heroui/react'
import { PropsWithChildren } from 'react'

export default function Panel(props: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      role="upload-panel"
      className={cn(
        'border-divider/70 bg-content1 w-full max-w-[860px] rounded-[28px] border px-6 py-6 shadow-sm sm:px-8',
        props.className
      )}
    >
      {props.children}
    </div>
  )
}
