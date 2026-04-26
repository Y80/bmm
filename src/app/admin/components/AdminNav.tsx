'use client'

import { ReButton, ThemeToggle } from '@/components'
import { ADMIN_NAV_LINKS, Assets, ExternalLinks, IconNames, PageRoutes, WEBSITE_NAME } from '@cfg'
import { Avatar, Button, Link, cn } from '@heroui/react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type NavLink = {
  label: string
  href: string
  icon: string
  description: string
  accent: string
  external?: boolean
  separatorBefore?: boolean
  separatorAfter?: boolean
}

interface AdminNavProps {
  links?: NavLink[]
  brandHref?: string
  mode?: 'admin' | 'user'
  brandTitle?: string
  userName?: string
  userImage?: string | null
  userEmail?: string
}

export default function AdminNav(props: AdminNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const links = props.links || ADMIN_NAV_LINKS
  const mode = props.mode || 'admin'
  const brandHref =
    props.brandHref || (mode === 'admin' ? PageRoutes.Admin.INDEX : PageRoutes.User.INDEX)
  const title = props.brandTitle || `${WEBSITE_NAME} CMS`
  const showUserIdentity = mode === 'user' && !!props.userName

  function isActiveLink(href: string) {
    if (href === PageRoutes.Admin.INDEX || href === PageRoutes.User.INDEX) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  function renderLinks(isMobile = false) {
    return links.map((link) => {
      const isActive = isActiveLink(link.href)

      return (
        <div key={link.href}>
          {link.separatorBefore ? <div className="bg-divider/70 mx-2 my-2 h-px" /> : null}
          <Button
            as="a"
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noreferrer' : undefined}
            fullWidth
            variant="light"
            color="default"
            onPress={() => setIsMobileMenuOpen(false)}
            className={cn(
              'group relative h-11 justify-start gap-3 rounded-xl px-3 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-150 focus-visible:ring-2 focus-visible:ring-cyan-400/45',
              isMobile
                ? 'hover:bg-content2/70 bg-transparent backdrop-blur'
                : 'text-foreground hover:text-foreground bg-transparent hover:bg-sky-500/8 dark:text-white/85',
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
            {link.external ? (
              <span
                className={cn(
                  IconNames.Tabler.EXTERNAL_LINK,
                  'ml-auto shrink-0 text-sm opacity-0 transition-opacity duration-150 group-hover:opacity-100'
                )}
              />
            ) : null}
          </Button>
          {link.separatorAfter ? <div className="bg-divider/70 mx-2 my-2 h-px" /> : null}
        </div>
      )
    })
  }

  return (
    <>
      <aside className="xs:flex xs:w-60 xs:shrink-0 hidden">
        <div className="sticky top-0 h-screen w-full px-4 py-6">
          <div className="border-divider/60 dark:bg-content1/80 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white/88 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.22)] backdrop-blur dark:shadow-xl dark:shadow-black/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_36%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.1),transparent_38%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:26px_26px] opacity-45 dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-20" />
            <Link
              href={brandHref}
              color="foreground"
              className="border-divider/40 group relative block border-b no-underline"
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg border border-sky-500/15 bg-white/88 text-slate-900 shadow-[0_10px_24px_-18px_rgba(14,165,233,0.35)] transition-[background-color,border-color,box-shadow] duration-150 group-hover:border-sky-500/25 group-hover:shadow-[0_12px_28px_-18px_rgba(14,165,233,0.45)] dark:border-white/10 dark:bg-white/10 dark:text-white dark:group-hover:bg-white/15 dark:group-hover:shadow-none">
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
                    {title}
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
                <div className="border-divider/60 flex items-center gap-1.5 rounded-xl border bg-white/78 p-1.5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.22)] dark:bg-white/[0.04] dark:shadow-none">
                  <ReButton
                    href={ExternalLinks.REPO}
                    target="_blank"
                    rel="noreferrer"
                    size="sm"
                    variant="light"
                    className="text-default-700 h-10 flex-1 justify-start gap-2 rounded-lg px-2.5 hover:bg-sky-500/8 dark:text-white/80 dark:hover:bg-white/[0.08]"
                    startContent={
                      <span
                        className={cn(
                          IconNames.Tabler.BRAND_GITHUB,
                          'text-foreground-600 xs:hover:text-foreground-800 shrink-0 text-2xl outline-hidden dark:text-white/70'
                        )}
                      />
                    }
                  >
                    <span className="truncate text-sm font-medium">项目地址</span>
                  </ReButton>
                  <div className="bg-divider/70 h-7 w-px shrink-0" />
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <ThemeToggle />
                  </div>
                </div>
                {showUserIdentity ? (
                  <Link
                    href={PageRoutes.User.SETTINGS}
                    color="foreground"
                    className="border-divider/60 mt-3 flex items-center gap-3 rounded-xl border bg-white/78 px-3 py-2.5 no-underline shadow-[0_10px_24px_-20px_rgba(15,23,42,0.22)] transition-[background-color,border-color,transform,box-shadow] duration-150 hover:-translate-y-px hover:border-sky-500/20 hover:bg-sky-500/6 hover:shadow-[0_14px_28px_-22px_rgba(14,165,233,0.28)] dark:bg-white/[0.04] dark:hover:border-white/12 dark:hover:bg-white/[0.06]"
                  >
                    <Avatar
                      size="sm"
                      src={props.userImage || undefined}
                      name={props.userName}
                      showFallback
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{props.userName}</div>
                      {props.userEmail ? (
                        <div className="text-default-500 truncate text-xs">{props.userEmail}</div>
                      ) : null}
                    </div>
                  </Link>
                ) : null}
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
            href={brandHref}
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
                内容管理
              </div>
              <div className="truncate text-sm font-semibold tracking-wide">{title}</div>
            </div>
          </Link>
          <ReButton
            href={ExternalLinks.REPO}
            target="_blank"
            rel="noreferrer"
            isIconOnly
            variant="light"
            size="sm"
          >
            <span className={IconNames.Tabler.BRAND_GITHUB} />
          </ReButton>
          <ThemeToggle />
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
