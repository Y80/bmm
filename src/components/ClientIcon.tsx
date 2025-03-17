'use client'

import useIsDark from '@/hooks/useIsDark'
import { calcForegroundColor } from '@/utils/color'
import { cn } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { memo, useMemo } from 'react'

interface Props {
  icon: string
  color?: string
  className?: string
}

function ClientIcon(props: Props) {
  const isDark = useIsDark()

  const color = useMemo(() => {
    if (!props.color) return
    return calcForegroundColor(props.color, isDark).hex()
  }, [props.color, isDark])

  if (props.icon.startsWith('icon-[')) {
    return (
      <span
        className={cn('size-5 text-xl flex-center', props.className, props.icon)}
        style={{ color }}
      />
    )
  }

  return (
    <span className={cn('size-5 text-xl flex-center', props.className)} style={{ color }}>
      <Icon icon={props.icon} />
    </span>
  )
}
export default memo(ClientIcon)
