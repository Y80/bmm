import { ButtonProps, NavbarProps } from '@heroui/react'

export const IconButtonProps = {
  className: 'text-2xl text-foreground-600 xs:hover:text-foreground-800 outline-hidden',
  isIconOnly: true,
  variant: 'light',
} satisfies ButtonProps

export const NavBarProps = {
  maxWidth: 'full',
  className: 'fixed dark:bg-black/25 light:bg-white/35',
  isBlurred: true,
  isBordered: true,
} satisfies NavbarProps

export const TagPickerBox = {
  SCROLLER_ROLE: 'tag-picker-scroller',
  ONLY_MAIN: 'tag-picker-only-main-tags',
  TOP: 'tag-picker-last-scrollTop',
  getOnlyMain: () => localStorage.getItem(TagPickerBox.ONLY_MAIN) === 'true',
  setOnlyMain: (onlyMain: boolean) => {
    localStorage.setItem(TagPickerBox.ONLY_MAIN, onlyMain.toString())
  },
  getScrollTop: () => Number(localStorage.getItem(TagPickerBox.TOP) || 0),
  saveScrollTop: () => {
    const scroller = document.querySelector(`div[role="${TagPickerBox.SCROLLER_ROLE}"]`)
    localStorage.setItem(TagPickerBox.TOP, (scroller?.scrollTop || 0).toString())
  },
}
