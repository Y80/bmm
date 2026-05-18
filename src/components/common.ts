import { ButtonProps, NavbarProps } from '@heroui/react'

export const IconButtonProps = {
  className: 'text-xl',
  isIconOnly: true,
} satisfies ButtonProps

export const NavBarProps = {
  maxWidth: 'full',
  className:
    'fixed border-b border-slate-200/80 bg-white/[0.42] shadow-[0_18px_48px_-34px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/6 dark:bg-[#06111c]/72',
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
