import { Background } from '@cfg'
import { cn } from '@heroui/react'

export function AppBackground() {
  return (
    <div
      role="app-background"
      className={cn('max-xs:hidden max-xs:dark:block fixed inset-0 -z-10 overflow-hidden')}
    >
      <div className={cn('absolute inset-0', Background.CLASS)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_26%),radial-gradient(circle_at_18%_72%,rgba(16,185,129,0.11),transparent_32%),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.09),transparent_24%),radial-gradient(circle_at_86%_86%,rgba(245,158,11,0.11),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_22%_72%,rgba(16,185,129,0.08),transparent_30%),radial-gradient(circle_at_76%_20%,rgba(59,130,246,0.06),transparent_22%),radial-gradient(circle_at_88%_84%,rgba(245,158,11,0.08),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0.14)_18%,transparent_32%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_20%)]" />
    </div>
  )
}
