import { Background } from '@cfg'
import { cn } from '@heroui/react'

export function AppBackground() {
  return (
    <div
      role="app-background"
      className={cn(
        'fixed -z-10 h-screen w-screen max-xs:hidden max-xs:dark:block',
        Background.CLASS
      )}
    >
      <div className="absolute left-[-12rem] top-[5rem] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.1),rgba(255,255,255,0))]" />
      <div className="absolute bottom-[-200px] right-[-200px] size-[50rem] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.1),rgba(255,255,255,0))]" />
    </div>
  )
}
