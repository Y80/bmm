import { ButtonProps, NavbarProps } from '@heroui/react'

export const IconButtonProps = {
  className:
    'text-xl text-default-600 border border-transparent bg-transparent outline-hidden transition-[background-color,color,box-shadow] hover:text-foreground hover:bg-white/70 hover:shadow-[0_14px_28px_-22px_rgba(15,23,42,0.18)] dark:text-white/72 dark:hover:text-white dark:hover:bg-white/[0.08] dark:hover:shadow-none rounded-xl',
  isIconOnly: true,
  variant: 'light',
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
