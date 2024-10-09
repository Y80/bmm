import { Background } from '@cfg'
import Color from 'color'

/**
 * 根据传入的 originColor，返回和背景对比度 >=3 的前景色
 */
export function calcForegroundColor(originColor: string, isDarkBg?: boolean) {
  const bg = Color(isDarkBg ? Background.DARK_HEX : Background.LIGHT_HEX)
  let c = Color(originColor)
  while (c.contrast(bg) < 3) {
    // lightness() 可以读取/赋值颜色的 HSL 中的亮度值
    c = c.lightness(c.lightness() + (isDarkBg ? 1 : -1))
  }
  return c
}
