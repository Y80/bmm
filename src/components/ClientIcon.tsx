'use client'

import useIsDark from '@/hooks/useIsDark'
import { calcForegroundColor } from '@/utils/color'
import { Icon } from '@iconify/react/dist/iconify.js'
import { memo, useMemo } from 'react'

interface Props {
  icon: string
  color?: string
}

function ClientIcon(props: Props) {
  const isDark = useIsDark()

  const color = useMemo(() => {
    if (!props.color) return
    return calcForegroundColor(props.color, isDark).hex()
  }, [props.color, isDark])

  return <Icon icon={props.icon} className="size-5 text-xl" style={{ color }} />
}
export default memo(ClientIcon)
