'use client'

import {
  Button,
  ButtonProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipProps,
} from '@heroui/react'
import { ReactNode, forwardRef, useState } from 'react'
import ReTooltip from './ReTooltip'

// 在原本的 Button 组件上，添加 loading 状态、tooltip、popover 等功能
// tooltip 和 popover 基本一致，只是触发时机不同
// tooltip 鼠标 hover 上去就会展示，popover 点击后才会展示
interface ReButtonProps extends ButtonProps {
  onClick?: () => any
  tooltip?: string | TooltipProps
  tooltipContent?: ReactNode
  popoverContent?: ReactNode
}

function ReButton_(props: ReButtonProps, ref: any) {
  const { onClick, tooltip, tooltipContent, popoverContent, ...resetProps } = props
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
      onPress={onClickWrapper}
      ref={ref}
    >
      {props.children}
    </Button>
  )

  if (tooltipContent) {
    return <ReTooltip content={tooltipContent}>{button}</ReTooltip>
  }
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
