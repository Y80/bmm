'use client'

/**
 * CmsSidebarNav — CMS 侧边栏导航
 *
 * 管理员和用户端共用的侧边栏布局组件。
 * 通过 mode 属性区分两种视觉风格（admin: 玫瑰色, user: 蓝色），
 * 支持移动端汉堡菜单和响应式布局。
 */

import ReButton from '@/components/re-export/ReButton'
import ThemeToggle from '@/components/ThemeToggle'
import { ADMIN_NAV_LINKS, Assets, ExternalLinks, IconNames, PageRoutes } from '@cfg'
import { Avatar, Button, Link, cn } from '@heroui/react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
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

interface CmsSidebarNavProps {
  links?: NavLink[]
  brandHref?: string
  mode?: 'admin' | 'user'
  brandTitle?: string
}

// admin / user 两种模式的视觉风格配置
const cmsTone = {
  admin: {
    sidebarBackdrop:
      'bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.13),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_38%)]',
    logo:
      'border-rose-500/15 bg-white/88 shadow-[0_10px_24px_-18px_rgba(244,63,94,0.35)] group-hover:border-rose-500/25 group-hover:shadow-[0_12px_28px_-18px_rgba(244,63,94,0.42)] dark:border-rose-300/12 dark:bg-rose-300/10',
    hover: 'hover:bg-rose-500/8',
    active:
      'bg-rose-500/10 text-rose-950 shadow-[0_12px_30px_-22px_rgba(244,63,94,0.35)] dark:bg-rose-300/10 dark:text-white',
  },
  user: {
    sidebarBackdrop:
      'bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.09),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_38%)]',
    logo:
      'border-sky-500/15 bg-white/88 shadow-[0_10px_24px_-18px_rgba(14,165,233,0.35)] group-hover:border-sky-500/25 group-hover:shadow-[0_12px_28px_-18px_rgba(14,165,233,0.45)] dark:border-white/10 dark:bg-white/10',
    hover: 'hover:bg-sky-500/8',
    active:
      'bg-sky-500/10 text-slate-900 shadow-[0_12px_30px_-22px_rgba(14,165,233,0.35)] dark:bg-white/10 dark:text-white',
  },
} as const

export default function CmsSidebarNav(props: CmsSidebarNavProps) {
  const pathname = usePathname()
  const session = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mode = props.mode || 'admin'
  const tone = cmsTone[mode]
  const links = props.links || ADMIN_NAV_LINKS
  const userName = session.data?.user?.name || '用户'
  const userImage = session.data?.user?.image || null
  const userIsAdmin = !!session.data?.user?.isAdmin

  // user 模式下管理员额外看到「网站内容管理」入口
  const navLinks =
    mode === 'user' && userIsAdmin
      ? [
          ...links.slice(0, 2),
          { ...links[2], separatorAfter: false },
          {
            label: '网站内容管理',
            href: PageRoutes.Admin.INDEX,
            icon: IconNames.Tabler.SHIELD_LOCK,
            description: '新开标签页进入管理员 CMS',
            accent: 'from-emerald-300 via-teal-400 to-cyan-500',
            external: true,
            separatorAfter: true,
          },
          ...links.slice(3),
        ]
      : links

  const brandHref =
    props.brandHref || (mode === 'admin' ? PageRoutes.Admin.INDEX : PageRoutes.User.INDEX)
  const brandText = mode === 'user' ? userName : props.brandTitle || '网站内容管理'

  // 判断当前链接是否激活（首页精确匹配，子页面前缀匹配）
  function isActiveLink(href: string) {
    if (href === PageRoutes.Admin.INDEX || href === PageRoutes.User.INDEX) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  // 渲染导航链接列表，isMobile 控制移动端样式差异
  function renderLinks(isMobile = false) {
    return navLinks.map((link) => {
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
                : cn('text-foreground hover:text-foreground bg-transparent dark:text-white/85', tone.hover),
              isActive && (isMobile ? 'bg-primary/10 text-primary' : tone.active)
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

  // 桌面端品牌 logo 区域：user 模式显示头像，admin 模式显示网站 logo
  function renderBrandLogo() {
    if (mode === 'user') {
      return (
        <Avatar
          size="sm"
          src={userImage || undefined}
          name={userName}
          showFallback
          className="size-10 shrink-0"
        />
      )
    }

    return (
      <div
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center rounded-lg border text-slate-900 transition-[background-color,border-color,box-shadow] duration-150 dark:text-white dark:group-hover:bg-white/15 dark:group-hover:shadow-none',
          tone.logo
        )}
      >
        <Image src={Assets.LOGO_SVG} width={25} height={25} alt="logo" className="relative z-10" />
      </div>
    )
  }

  // 移动端品牌 logo（同上逻辑，尺寸略小）
  function renderMobileBrandLogo() {
    if (mode === 'user') {
      return (
        <Avatar
          size="sm"
          src={userImage || undefined}
          name={userName}
          showFallback
          className="size-9 shrink-0"
        />
      )
    }

    return (
      <div className="border-divider/70 from-content2 to-content1 relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-sm">
        <Image src={Assets.LOGO_SVG} width={20} height={20} alt="logo" className="relative z-10" />
      </div>
    )
  }

  return (
    <>
      {/* 桌面端侧边栏 */}
      <aside className="xs:flex xs:w-60 xs:shrink-0 hidden">
        <div className="sticky top-0 h-screen w-full px-4 py-6">
          <div className="border-divider/60 dark:bg-content1/80 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white/88 shadow-[0_20px_48px_-34px_rgba(15,23,42,0.22)] backdrop-blur dark:shadow-xl dark:shadow-black/5">
            <div className={cn('absolute inset-0', tone.sidebarBackdrop)} />
            <Link
              href={brandHref}
              color="foreground"
              className="border-divider/40 group relative block border-b no-underline"
            >
              <div className="flex items-center gap-3 px-4 py-3.5">
                {renderBrandLogo()}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[0.95rem] leading-6 font-semibold">{brandText}</div>
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
                <div className="border-divider/60 flex items-center gap-1.5 rounded-xl border bg-white/42 p-1.5 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.16)] backdrop-blur-md dark:bg-white/[0.04] dark:shadow-none">
                  <ReButton
                    href={ExternalLinks.REPO}
                    target="_blank"
                    rel="noreferrer"
                    size="sm"
                    variant="light"
                    className={cn(
                      'text-default-700 h-10 flex-1 justify-start gap-2 rounded-lg px-2.5 dark:text-white/80 dark:hover:bg-white/[0.08]',
                      tone.hover
                    )}
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
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 移动端顶部导航栏 */}
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
            {renderMobileBrandLogo()}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-wide">{brandText}</div>
            </div>
          </Link>
          <ReButton
            href={ExternalLinks.REPO}
            target="_blank"
            rel="noreferrer"
            isIconOnly
            variant="light"
            size="sm"
            className="size-10 min-w-10 rounded-xl text-lg"
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
