import { ButtonProps, NavbarProps } from '@heroui/react'

export const IconButtonProps = {
  className: 'text-2xl text-foreground-600 xs:hover:text-foreground-800 outline-none',
  isIconOnly: true,
  variant: 'light',
} satisfies ButtonProps

export const NavBarProps = {
  maxWidth: 'full',
  className: 'fixed dark:bg-black/25 light:bg-white/35',
  isBlurred: true,
  isBordered: true,
} satisfies NavbarProps
