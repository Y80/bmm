'use client'

import useIsDark from '@/hooks/useIsDark'
import { cn } from '@/utils'
import { calcForegroundColor } from '@/utils/color'
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

  return (
    <span className={cn('size-5 text-xl flex-center', props.className)} style={{ color }}>
      <Icon icon={props.icon} />
    </span>
  )
}
export default memo(ClientIcon)
