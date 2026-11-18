import { Background } from '@cfg'
import { cn } from '@heroui/react'

export function AppBackground() {
  return (
    <div role="app-background" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={cn('absolute inset-0', Background.CLASS)} />
      <div className="absolute top-[-6vmin] right-[-8vmin] size-[52vmin] bg-[radial-gradient(circle_at_center,rgba(196,181,253,0.2),transparent_64%)] dark:hidden" />
      <div className="absolute bottom-0 left-0 size-[62vmin] -translate-x-1/4 translate-y-1/4 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.14),transparent_66%)] dark:hidden" />
    </div>
  )
}
