import {
  Button,
  ButtonProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@heroui/react'
import { ComponentProps, ReactNode, forwardRef, useState } from 'react'
import ReTooltip from './ReTooltip'

interface ReButtonProps extends ButtonProps {
  onClick?: () => any
  tooltip?: string | ComponentProps<typeof Tooltip>
  popoverContent?: ReactNode
}

function ReButton_(props: ReButtonProps, ref: any) {
  const { onClick, tooltip, popoverContent, ...resetProps } = props
  const [loading, setLoading] = useState(false)

  const mergedLoading = props.isLoading || loading

  function onClickWrapper() {
    if (mergedLoading) return
    const result = props.onClick?.()
    // 在 Promise 实例 resolved 之前，展示加载动画加载、禁用点击
    if (result instanceof Promise) {
      setLoading(true)
      result.finally(() => setLoading(false))
    }
  }

  const button = (
    <Button
      {...resetProps}
      disableRipple
      startContent={mergedLoading ? null : resetProps.startContent}
      as={props.href ? 'a' : undefined}
      disabled={mergedLoading || props.disabled}
      isLoading={mergedLoading}
      onClick={onClickWrapper}
      ref={ref}
    >
      {props.children}
    </Button>
  )

  if (tooltip) {
    if (typeof tooltip === 'string') {
      return <ReTooltip content={tooltip}>{button}</ReTooltip>
    }
    return <ReTooltip {...tooltip}>{button}</ReTooltip>
  }

  if (popoverContent) {
    return (
      <Popover>
        <PopoverTrigger>{button}</PopoverTrigger>
        <PopoverContent>{popoverContent}</PopoverContent>
      </Popover>
    )
  }

  return button
}

const ReButton = forwardRef<any, ReButtonProps>(ReButton_)

export default ReButton
