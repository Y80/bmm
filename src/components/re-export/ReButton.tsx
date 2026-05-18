import { useIsMobile } from '@/hooks'
import {
  Button,
  ButtonProps,
  cn,
  Popover,
  PopoverContent,
  PopoverProps,
  PopoverTrigger,
  TooltipProps,
} from '@heroui/react'
import { omit } from 'lodash'
import { ReactNode, forwardRef, useState } from 'react'
import ReTooltip from './ReTooltip'

const ICON_BUTTON_CLS =
  'min-w-0 gap-0 rounded-xl bg-transparent px-0 text-default-600 transition-[background-color,color,box-shadow] hover:bg-default-100 hover:text-foreground data-[hover=true]:bg-default-100 data-[hover=true]:text-foreground dark:text-white/72 dark:hover:bg-white/[0.08] dark:hover:text-white dark:data-[hover=true]:bg-white/[0.08] dark:data-[hover=true]:text-white [tr:hover_&:hover]:bg-default-200 [tr:hover_&[data-hover=true]]:bg-default-200 [tr[data-selected=true]_&:hover]:bg-default-300 [tr[data-selected=true]_&[data-hover=true]]:bg-default-300 [tr[aria-selected=true]_&:hover]:bg-default-300 [tr[aria-selected=true]_&[data-hover=true]]:bg-default-300 dark:[tr:hover_&:hover]:bg-white/[0.14] dark:[tr:hover_&[data-hover=true]]:bg-white/[0.14] dark:[tr[data-selected=true]_&:hover]:bg-white/[0.18] dark:[tr[data-selected=true]_&[data-hover=true]]:bg-white/[0.18] dark:[tr[aria-selected=true]_&:hover]:bg-white/[0.18] dark:[tr[aria-selected=true]_&[data-hover=true]]:bg-white/[0.18]'

const ICON_BUTTON_ADJACENT_CLS = '[&+&]:ml-0'

const LINK_BUTTON_CLS =
  'h-auto min-w-0 gap-1 rounded-md bg-transparent px-0 py-0 text-primary underline-offset-4 hover:bg-transparent hover:text-primary/80 hover:underline data-[hover=true]:bg-transparent data-[hover=true]:text-primary/80 data-[hover=true]:underline'

// 在原本的 Button 组件上，添加 loading 状态、tooltip、popover 等功能
// tooltip 和 popover 基本一致，只是触发时机不同
// tooltip 鼠标 hover 上去就会展示，popover 点击后才会展示
interface ReButtonProps extends ButtonProps {
  buttonType?: 'link'
  icon?: ReactNode
  onClick?: () => any
  tooltip?: string | (TooltipProps & { adaptMobile?: boolean })
  popoverContent?: ReactNode
  popoverProps?: Partial<PopoverProps>
}

function ReButton_(props: ReButtonProps, ref: any) {
  const { buttonType, icon, onClick, tooltip, popoverContent, ...resetProps } = props
  const isMobile = useIsMobile()
  const [loading, setLoading] = useState(false)

  const mergedLoading = props.isLoading || loading
  const isIconButton = props.isIconOnly
  const isLinkButton = buttonType === 'link'
  const children = icon || props.children
  const startContent = icon || isIconButton ? undefined : resetProps.startContent
  const variant = resetProps.variant || (isIconButton || isLinkButton ? 'light' : undefined)
  const size = resetProps.size || (isIconButton ? 'sm' : undefined)
  const className = cn(
    isIconButton && ICON_BUTTON_CLS,
    isIconButton && ICON_BUTTON_ADJACENT_CLS,
    isLinkButton && LINK_BUTTON_CLS,
    props.className
  )

  function onClickWrapper(event: any) {
    if (mergedLoading) return
    resetProps.onPress?.(event)
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
      className={className}
      disableRipple
      isIconOnly={isIconButton}
      size={size}
      startContent={mergedLoading ? null : startContent}
      as={props.href ? 'a' : undefined}
      variant={variant}
      disabled={mergedLoading || props.disabled}
      isLoading={mergedLoading}
      onPress={props.onClick ? onClickWrapper : resetProps.onPress}
      ref={ref}
    >
      {children}
    </Button>
  )

  if (tooltip) {
    const tooltipProps = typeof tooltip === 'string' ? { content: tooltip } : tooltip

    // 移动端不支持 Tooltip
    // https://github.com/heroui-inc/heroui/issues/2036
    if (isMobile && tooltipProps.adaptMobile) {
      return (
        <Popover>
          <PopoverTrigger>{button}</PopoverTrigger>
          <PopoverContent>{tooltipProps.content}</PopoverContent>
        </Popover>
      )
    }
    return <ReTooltip {...omit(tooltipProps, 'adaptMobile')}>{button}</ReTooltip>
  }
  if (popoverContent) {
    return (
      <Popover {...props.popoverProps}>
        <PopoverTrigger>{button}</PopoverTrigger>
        <PopoverContent>{popoverContent}</PopoverContent>
      </Popover>
    )
  }

  return button
}

const ReButton = forwardRef<any, ReButtonProps>(ReButton_)

export default ReButton
