'use client'

import { useIsClient } from '@/hooks'
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
  const isClient = useIsClient()

  const color = useMemo(() => {
    if (!props.color || !isClient) return
    return calcForegroundColor(props.color, isDark).hex()
  }, [props.color, isDark, isClient])

  const rootProps = {
    className: cn('size-5 text-xl flex-center shrink-0', props.className),
    style: { color },
  }

  if (props.icon.startsWith('icon-[')) {
    return <span {...rootProps} className={cn(rootProps.className, props.icon)} />
  }

  return (
    <span {...rootProps}>
      <Icon icon={props.icon} />
    </span>
  )
}
export default memo(ClientIcon)
