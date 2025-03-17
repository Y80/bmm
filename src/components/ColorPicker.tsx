'use client'

import { calcForegroundColor } from '@/utils/color'
import { Background, IconNames } from '@cfg'
import {
  Button,
  cn,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
} from '@heroui/react'
import { useSetState } from 'ahooks'
import Color from 'color'
import { useLayoutEffect, useMemo } from 'react'
import { HexColorPicker } from 'react-colorful'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  defaultValue?: string | undefined | null
  onClose: () => void
  onSelect?: (value: string) => void
}

const DEFAULT_COLOR = '#CE00FF'

export default function ColorPicker(props: Props) {
  const [state, setState] = useSetState({
    color: DEFAULT_COLOR,
    inputColor: '',
  })

  // 同步打开弹窗时，传进来的色值
  useLayoutEffect(() => {
    if (props.isOpen && props.defaultValue) {
      setState({ color: props.defaultValue })
    }
  }, [props.isOpen, props.defaultValue, setState])

  function handleChangeColor(color: string) {
    setState({ color })
  }

  function handleInputColorComplete() {
    if (!state.inputColor) return
    try {
      let c = Color(state.inputColor)
      setState({
        inputColor: '',
        color: c.hexa(),
      })
    } catch (error) {
      toast.error('无效的色值')
      setState({ inputColor: '' })
    }
  }

  const foregroundColors = useMemo(() => {
    const lightColor = calcForegroundColor(state.color)
    const darkColor = calcForegroundColor(state.color, true)
    return {
      light: {
        color: lightColor,
        contrast: lightColor.contrast(Color(Background.LIGHT_HEX)).toFixed(3),
      },
      dark: {
        color: darkColor,
        contrast: darkColor.contrast(Color(Background.DARK_HEX)).toFixed(3),
      },
    }
  }, [state.color])

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} backdrop="blur">
      <ModalContent>
        <ModalHeader>选取主题色</ModalHeader>
        <ModalBody>
          <HexColorPicker
            className="[&_.react-colorful__saturation] !h-80 !w-full"
            color={state.color}
            onChange={handleChangeColor}
          />
          <div
            style={{ backgroundColor: state.color }}
            className={cn(
              'mt-2 gap-1 rounded-lg py-1 flex-center',
              Color(state.color).isDark() ? 'text-white' : 'text-black'
            )}
          >
            <input
              type="text"
              value={(state.inputColor || state.color).toUpperCase()}
              className="w-auto bg-transparent text-center focus:outline-0"
              onChange={(e) => setState({ inputColor: e.target.value })}
              onBlur={handleInputColorComplete}
            />
          </div>
          <div className="mt-4 text-sm">
            <div className="gap-2 flex-items-center">
              <label>预览</label>
              <Tooltip
                content={
                  <div className="max-w-64">
                    如果所选颜色和背景色对比度过低，将自动处理颜色明暗度，以保证可阅读性
                  </div>
                }
              >
                <span className={cn(IconNames.QUESTION_CIRCLE, 'cursor-pointer text-base')} />
              </Tooltip>
            </div>
            <Divider className="mt-2" />
            <div className="mt-4 flex">
              <section className="w-[48%]">
                <div className="mb-2 text-xs text-foreground-500">
                  <span>明亮</span>
                  <span>（对比度：{foregroundColors.light.contrast}）</span>
                </div>
                <div className={cn('rounded-xl border p-4', Background.LIGHT_CLASS)}>
                  <div
                    className="mx-auto gap-2 rounded-xl py-2 flex-center"
                    style={{
                      color: foregroundColors.light.color.hex(),
                      backgroundColor: foregroundColors.light.color.fade(0.85).toString(),
                    }}
                  >
                    <span className={IconNames.TAG} />
                    <span>Tag 测试</span>
                  </div>
                </div>
              </section>
              <section className="ml-auto w-[48%]">
                <div className="mb-2 text-xs text-foreground-500">
                  <span>暗夜</span>
                  <span>（对比度：{foregroundColors.dark.contrast}）</span>
                </div>
                <div className={cn('rounded-xl border p-4', Background.DARK_CLASS)}>
                  <div
                    className="mx-auto gap-2 rounded-xl py-2 flex-center"
                    style={{
                      color: foregroundColors.dark.color.hex(),
                      backgroundColor: foregroundColors.dark.color.fade(0.85).toString(),
                    }}
                  >
                    <span className={IconNames.TAG} />
                    <span>Tag 测试</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() => {
              props.onClose()
              props.onSelect?.(state.color.toUpperCase())
            }}
          >
            确 定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
