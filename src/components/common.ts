import { ButtonProps, NavbarProps } from '@heroui/react'

export const IconButtonProps = {
  className: 'text-xl',
  isIconOnly: true,
} satisfies ButtonProps

export const NavBarProps = {
  maxWidth: 'full',
  className:
    'fixed border-b border-slate-200/55 bg-white/28 backdrop-blur-xl dark:border-white/12 dark:bg-white/[0.045]',
  isBlurred: true,
  isBordered: false,
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
