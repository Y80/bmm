import { Tooltip } from '@heroui/react'
import { ComponentProps } from 'react'

export default function ReTooltip(props: ComponentProps<typeof Tooltip>) {
  return <Tooltip showArrow {...props} />
}
