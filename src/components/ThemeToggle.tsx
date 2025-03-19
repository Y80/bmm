'use client'

import { NavIconOnlyButtonProps } from '@/app/(public)/components/Nav'
import useIsClient from '@/hooks/useIsClient'
import { IconNames } from '@cfg'
import { cn, Listbox, ListboxItem } from '@heroui/react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import ReButton from './re-export/ReButton'

const ThemeListItems = [
  { key: 'light', label: 'Light', icon: IconNames.SUN },
  { key: 'dark', label: 'Dark', icon: IconNames.MOON_STARS },
  { key: 'system', label: 'System', icon: IconNames.DEVICE_DESKTOP },
]

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [selectedKeys, setSelectedKeys] = useState([theme!])
  const isClient = useIsClient()
  const currentThemeIcon = ThemeListItems.find((el) => el.key === selectedKeys[0])?.icon

  function finalSetTheme(theme: string) {
    setSelectedKeys([theme])
    setTheme(theme)
  }

  return (
    <>
      {/* 仅在 Mobile + Dark 条件下展示 */}
      <ReButton
        role="mobile-dark-button"
        {...NavIconOnlyButtonProps}
        className={cn(NavIconOnlyButtonProps.className, 'hidden max-xs:dark:flex')}
        onClick={() => finalSetTheme('light')}
      >
        <span className={IconNames.MOON_STARS} />
      </ReButton>
      {/* 仅在 Mobile + Light 条件下展示 */}
      <ReButton
        role="mobile-light-button"
        {...NavIconOnlyButtonProps}
        className={cn(NavIconOnlyButtonProps.className, 'hidden max-xs:light:flex')}
        onClick={() => finalSetTheme('dark')}
      >
        <span className={IconNames.SUN} />
      </ReButton>
      {/* PC 端的主题切换按钮 */}
      <ReButton
        {...NavIconOnlyButtonProps}
        className={cn(NavIconOnlyButtonProps.className, 'max-xs:hidden')}
        tooltip={{
          placement: 'bottom-end',
          content: (
            <Listbox
              className="w-36"
              aria-label="theme list"
              selectionMode="single"
              disallowEmptySelection
              selectedKeys={selectedKeys}
              onSelectionChange={(v) => finalSetTheme([...v][0] as string)}
            >
              {ThemeListItems.map((item) => (
                <ListboxItem key={item.key} startContent={<span className={item.icon} />}>
                  {item.label}
                </ListboxItem>
              ))}
            </Listbox>
          ),
        }}
      >
        <span className={isClient ? currentThemeIcon : IconNames.DEVICE_DESKTOP} />
      </ReButton>
    </>
  )
}
