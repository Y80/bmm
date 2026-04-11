'use client'

import useIsClient from '@/hooks/useIsClient'
import { IconNames } from '@cfg'
import { cn, Listbox, ListboxItem } from '@heroui/react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { IconButtonProps } from './common'
import ReButton from './re-export/ReButton'

const ThemeListItems = [
  { key: 'light', label: 'Light', icon: IconNames.Tabler.SUN },
  { key: 'dark', label: 'Dark', icon: IconNames.Tabler.MOON_STARS },
  { key: 'system', label: 'System', icon: IconNames.Tabler.DEVICE_DESKTOP },
]

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [selectedKeys, setSelectedKeys] = useState([theme!])
  const isClient = useIsClient()
  const currentThemeIcon = ThemeListItems.find((el) => el.key === selectedKeys[0])?.icon

  function mergedSetTheme(theme: string) {
    setSelectedKeys([theme])
    setTheme(theme)
  }

  return (
    <>
      {/* 仅在 Mobile + Dark 条件下展示 */}
      <ReButton
        role="mobile-dark-button"
        {...IconButtonProps}
        className={cn(IconButtonProps.className, 'max-xs:dark:flex hidden')}
        onClick={() => mergedSetTheme('light')}
      >
        <span className={IconNames.Tabler.MOON_STARS} />
      </ReButton>
      {/* 仅在 Mobile + Light 条件下展示 */}
      <ReButton
        role="mobile-light-button"
        {...IconButtonProps}
        className={cn(IconButtonProps.className, 'max-xs:light:flex hidden')}
        onClick={() => mergedSetTheme('dark')}
      >
        <span className={IconNames.Tabler.SUN} />
      </ReButton>
      {/* PC 端的主题切换按钮 */}
      <ReButton
        {...IconButtonProps}
        className={cn(IconButtonProps.className, 'max-xs:hidden')}
        tooltip={{
          placement: 'bottom-end',
          content: (
            <Listbox
              className="w-36"
              aria-label="theme list"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={selectedKeys}
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
