import { cn } from '@heroui/react'
import { PropsWithChildren } from 'react'

export default function Panel(props: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      role="upload-panel"
      className={cn(
        'bg-foreground-50 light:border w-[680px] rounded-xl px-8 py-6',
        props.className
      )}
    >
      {props.children}
    </div>
  )
}
