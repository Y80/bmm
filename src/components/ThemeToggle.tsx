'use client'

import useIsClient from '@/hooks/useIsClient'
import { IconNames } from '@cfg'
import { cn, Listbox, ListboxItem } from '@heroui/react'
import { useTheme } from 'next-themes'
import { IconButtonProps } from './common'
import ReButton from './re-export/ReButton'

const ThemeListItems = [
  { key: 'light', label: 'Light', icon: IconNames.Tabler.SUN },
  { key: 'dark', label: 'Dark', icon: IconNames.Tabler.MOON_STARS },
  { key: 'system', label: 'System', icon: IconNames.Tabler.DEVICE_DESKTOP },
]

export default function ThemeToggle() {
  const { resolvedTheme, setTheme, theme } = useTheme()
  const isClient = useIsClient()
  const currentThemeKey = theme || 'system'
  const currentThemeIcon = ThemeListItems.find((el) => el.key === currentThemeKey)?.icon

  function mergedSetTheme(theme: string) {
    setTheme(theme)
  }

  function cycleTheme() {
    mergedSetTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      {/* 仅在 Mobile + Dark 条件下展示 */}
      <ReButton
        role="mobile-dark-button"
        {...IconButtonProps}
        className={cn(IconButtonProps.className, 'max-xs:dark:flex hidden')}
        onClick={cycleTheme}
      >
        <span className={IconNames.Tabler.MOON_STARS} />
      </ReButton>
      {/* 仅在 Mobile + Light 条件下展示 */}
      <ReButton
        role="mobile-light-button"
        {...IconButtonProps}
        className={cn(IconButtonProps.className, 'max-xs:light:flex hidden')}
        onClick={cycleTheme}
      >
        <span className={IconNames.Tabler.SUN} />
      </ReButton>
      {/* PC 端的主题切换按钮 */}
      <ReButton
        {...IconButtonProps}
        className={cn(IconButtonProps.className, 'max-xs:hidden')}
        onClick={cycleTheme}
        tooltip={{
          placement: 'bottom-end',
          content: (
            <Listbox
              className="w-36"
              aria-label="theme list"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={[currentThemeKey]}
              onSelectionChange={(v) => mergedSetTheme([...v][0] as string)}
            >
              {ThemeListItems.map((item) => (
                <ListboxItem
                  key={item.key}
                  startContent={<span className={cn(item.icon, 'text-lg')} />}
                >
                  {item.label}
                </ListboxItem>
              ))}
            </Listbox>
          ),
        }}
      >
        <span className={isClient ? currentThemeIcon : IconNames.Tabler.DEVICE_DESKTOP} />
      </ReButton>
    </>
  )
}
