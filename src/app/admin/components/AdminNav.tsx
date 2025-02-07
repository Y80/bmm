'use client'

import { useGlobalContext } from '@/app/ctx'
import { NavIconOnlyButtonProps } from '@/components/MainPage/components/Nav'
import ReButton from '@/components/re-export/ReButton'
import ThemeToggle from '@/components/ThemeToggle'
import { ADMIN_NAV_LINKS, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { cn, Link, Navbar, NavbarContent } from '@heroui/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const { tags, totalBookmarks } = useGlobalContext()

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
    <Navbar maxWidth="full" className="dark:bg-slate-950/80" isBlurred>
      <NavbarContent className="max-sm:!flex-grow-0">
        <Link href="/admin" color="foreground">
          <div className="flex cursor-pointer items-center gap-4">
            <Image
              src="/logo-no-bg.svg"
              width={48}
              height={48}
              className="hidden sm:inline-block"
              alt="logo"
            />
            <h3 className="font-mono text-2xl font-black">{WEBSITE_NAME} CMS</h3>
          </div>
        </Link>
      </NavbarContent>
      <NavbarContent justify="end" className="gap-0">
        {renderLinks()}

        <ReButton
          {...NavIconOnlyButtonProps}
          className={cn(
            NavIconOnlyButtonProps.className,
            (!tags.length || !totalBookmarks) && 'hidden'
          )}
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
