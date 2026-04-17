'use client'

import { ReButton, ThemeToggle } from '@/components'
import { ADMIN_NAV_LINKS, Assets, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { Button, Link, cn } from '@heroui/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function AdminNav() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function isActiveLink(href: string) {
    if (href === PageRoutes.Admin.INDEX) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function renderLinks(isMobile = false) {
    return ADMIN_NAV_LINKS.map((link) => {
      const isActive = isActiveLink(link.href)

      return (
        <Button
          key={link.href}
          as="a"
          href={link.href}
          fullWidth
          variant="light"
          color="default"
          onPress={() => setIsMobileMenuOpen(false)}
          className={cn(
            'group relative h-11 justify-start gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 focus-visible:ring-2 focus-visible:ring-cyan-400/45',
            isMobile
              ? 'bg-transparent backdrop-blur hover:bg-content2/70'
              : 'text-foreground hover:bg-sky-500/8 hover:text-foreground bg-transparent dark:text-white/85',
            isActive &&
              (isMobile
                ? 'bg-primary/10 text-primary'
                : 'border border-sky-500/15 bg-sky-500/10 text-slate-900 shadow-[0_12px_30px_-22px_rgba(14,165,233,0.35)] dark:border-white/10 dark:bg-white/10 dark:text-white')
          )}
        >
          <div
            className={cn(
              'absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b transition-opacity duration-200',
              link.accent,
              isActive ? 'opacity-100' : 'opacity-0'
            )}
          />

          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg text-lg transition-[background-color,color,opacity] duration-150',
              isMobile
                ? 'text-default-700 group-hover:text-primary'
                : 'text-slate-600 group-hover:text-slate-900 dark:text-white/78 dark:group-hover:text-white',
              isActive && (isMobile ? 'text-primary' : 'text-slate-900 dark:text-white')
            )}
          >
            <span className={link.icon} />
          </div>

          <span className="truncate">{link.label}</span>
        </Button>
      )
    })
  }

  return (
    <>
      <aside className="xs:flex xs:w-60 xs:shrink-0 hidden">
        <div className="sticky top-0 h-screen w-full px-4 py-6">
          <div className="border-divider/60 bg-white/88 dark:bg-content1/80 relative flex h-full flex-col overflow-hidden rounded-2xl border shadow-[0_20px_48px_-34px_rgba(15,23,42,0.22)] dark:shadow-xl dark:shadow-black/5 backdrop-blur">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.1),transparent_38%)]" />
            <div className="absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:26px_26px] opacity-45 dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-20" />
            <Link
              href={PageRoutes.Admin.INDEX}
              color="foreground"
              className="border-divider/40 group relative block border-b no-underline"
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="border-sky-500/15 bg-white/88 text-slate-900 relative flex size-10 shrink-0 items-center justify-center rounded-lg border shadow-[0_10px_24px_-18px_rgba(14,165,233,0.35)] transition-[background-color,border-color,box-shadow] duration-150 group-hover:border-sky-500/25 group-hover:shadow-[0_12px_28px_-18px_rgba(14,165,233,0.45)] dark:border-white/10 dark:bg-white/10 dark:text-white dark:group-hover:bg-white/15 dark:group-hover:shadow-none">
                  <Image
                    src={Assets.LOGO_SVG}
                    width={25}
                    height={25}
                    alt="logo"
                    className="relative z-10"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-default-500 flex items-center gap-1.5 text-xs font-medium">
                    <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
                    <span>内容管理</span>
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[0.95rem] leading-6 font-semibold">
                    {WEBSITE_NAME} CMS
                  </div>
                </div>
              </div>
            </Link>

            <div className="relative flex min-h-0 flex-1 flex-col p-3">
              <div className="text-default-500 px-2 pt-1 pb-2 text-[0.7rem] font-medium tracking-[0.28em] uppercase">
                Navigation
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">{renderLinks()}</nav>
            </div>

            <div className="border-divider/40 relative border-t">
              <div className="p-3">
                <div className="border-divider/60 bg-white/78 dark:bg-white/[0.04] flex items-center gap-1.5 rounded-xl border p-1.5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.22)] dark:shadow-none">
                  <ReButton
                    href="/"
                    size="sm"
                    variant="light"
                    className="text-default-700 hover:bg-sky-500/8 h-10 flex-1 justify-start gap-2 rounded-lg px-2.5 dark:text-white/80 dark:hover:bg-white/[0.08]"
                    startContent={
                      <span
                        className={cn(
                          IconNames.Tabler.HOME,
                          'text-foreground-600 xs:hover:text-foreground-800 shrink-0 text-2xl outline-hidden dark:text-white/70'
                        )}
                      />
                    }
                  >
                    <span className="truncate text-sm font-medium">访问前台</span>
                  </ReButton>
                  <div className="bg-divider/70 h-7 w-px shrink-0" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="border-divider bg-background/95 xs:hidden fixed inset-x-0 top-0 z-40 border-b backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={() => setIsMobileMenuOpen((value) => !value)}
          >
            <span className={cn(IconNames.Tabler.LIST, 'text-lg')} />
          </Button>
          <Link
            href={PageRoutes.Admin.INDEX}
            color="foreground"
            className="flex min-w-0 flex-1 items-center gap-3 no-underline"
          >
            <div className="border-divider/70 from-content2 to-content1 relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-sm">
              <Image
                src={Assets.LOGO_SVG}
                width={20}
                height={20}
                alt="logo"
                className="relative z-10"
              />
            </div>
            <div className="min-w-0">
              <div className="text-default-500 flex items-center gap-1.5 text-[0.6rem] tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                管理后台
              </div>
              <div className="truncate text-sm font-semibold tracking-wide">{WEBSITE_NAME} CMS</div>
            </div>
          </Link>
          <ReButton href="/" isIconOnly variant="light" size="sm">
            <span className={IconNames.Tabler.HOME} />
          </ReButton>
          <ThemeToggle size="sm" />
        </div>

        {isMobileMenuOpen && (
          <div className="border-divider bg-background/95 border-t px-4 pt-2 pb-4">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="text-default-400 text-xs font-medium tracking-wider uppercase">
                Navigation
              </span>
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => setIsMobileMenuOpen(false)}
              >
                <span className={IconNames.Tabler.X} />
              </Button>
            </div>
            <nav className="grid gap-1">{renderLinks(true)}</nav>
          </div>
        )}
      </div>
    </>
  )
}
