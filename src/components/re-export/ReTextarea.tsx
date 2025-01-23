import { Textarea } from '@heroui/react'
import { ComponentProps } from 'react'

export default function ReTextarea(props: ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      placeholder=" "
      labelPlacement="outside"
      // 修复 hydrate 造成的高度抖动
      style={{ height: '60px !important', ...props.style }}
      {...props}
    />
  )
}
