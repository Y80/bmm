'use client'

import { IconButtonProps, NavBarProps } from '@/components/common'
import { ReButton } from '@/components/re-export'
import ThemeToggle from '@/components/ThemeToggle'
import { ADMIN_NAV_LINKS, Assets, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { cn, Link, Navbar, NavbarContent } from '@heroui/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAdminContext } from '../ctx'

export default function AdminNav() {
  const pathname = usePathname()
  const { tags, totalBookmarks } = useAdminContext()

  function renderLinks() {
    if (pathname === PageRoutes.Admin.INDEX) return null
    return ADMIN_NAV_LINKS.map((link) => (
      <Link
        key={link.href}
        underline={pathname.includes(link.href) ? 'always' : undefined}
        isBlock
        color="foreground"
        href={link.href}
        className="px-3 py-2 underline-offset-8"
      >
        {link.label}
      </Link>
    ))
  }

  return (
    <Navbar {...NavBarProps}>
      <NavbarContent className="max-sm:grow-0!">
        <Link href={PageRoutes.Admin.INDEX} color="foreground">
          <div className="flex cursor-pointer items-center gap-4">
            <Image
              src={Assets.LOGO_NO_BG_SVG}
              width={48}
              height={48}
              className="hidden sm:inline-block"
              alt="logo"
            />
            <h3 className="font-mono text-2xl font-black text-foreground-700">
              {WEBSITE_NAME} CMS
            </h3>
          </div>
        </Link>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-0">
        {renderLinks()}

        <ReButton
          {...IconButtonProps}
          className={cn(IconButtonProps.className, (!tags.length || !totalBookmarks) && 'hidden')}
          href="/"
          tooltip={{
            placement: 'bottom-end',
            content: '前往主页',
          }}
        >
          <span className={IconNames.HOME} />
        </ReButton>
        <ThemeToggle />
      </NavbarContent>
    </Navbar>
  )
}
