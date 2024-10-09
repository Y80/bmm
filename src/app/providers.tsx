'use client'

import useIsDark from '@/hooks/useIsDark'
import { getAllPublicTags } from '@/lib/actions'
import { Background, PageRoutes } from '@cfg'
import { cn, NextUIProvider, semanticColors } from '@nextui-org/react'
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { redirect, usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { PropsWithChildren, useCallback, useState } from 'react'
import { GlobalContextProvider, GlobalContextType } from './ctx'

type Props = Pick<GlobalContextType, 'tags' | 'totalBookmarks'> & {
  session: Session | null
}

export default function Providers(props: PropsWithChildren<Props>) {
  const [tags, setTags] = useState(props.tags)

  const pathname = usePathname()

  if (!props.tags.length || !props.totalBookmarks) {
    if (pathname !== PageRoutes.LOGIN && !pathname.startsWith(PageRoutes.Admin.INDEX)) {
      redirect(PageRoutes.LOGIN)
    }
  }

  const refreshTags = useCallback(async () => {
    const tags = await getAllPublicTags()
    setTags(tags)
  }, [setTags])

  useReportWebVitals((metric) => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) return
    // @ts-ignore
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value), // values must be integers
      event_label: metric.id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    })
  })

  return (
    <GlobalContextProvider
      value={{
        tags,
        totalBookmarks: props.totalBookmarks,
        refreshTags,
        mutateTags: setTags,
      }}
    >
      <div
        className={cn(
          'fixed -z-10 h-screen w-screen max-xs:hidden max-xs:dark:block',
          Background.CLASS
        )}
      >
        <div className="absolute left-[-12rem] top-[5rem] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.1),rgba(255,255,255,0))]" />
        <div className="absolute bottom-[-200px] right-[-200px] size-[50rem] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.1),rgba(255,255,255,0))]" />
      </div>
      <NextUIProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AntdConfigProviderWrapper>
            <SessionProvider session={props.session}>{props.children}</SessionProvider>
          </AntdConfigProviderWrapper>
        </ThemeProvider>
      </NextUIProvider>
    </GlobalContextProvider>
  )
}

function AntdConfigProviderWrapper({ children }: PropsWithChildren) {
  const isDark = useIsDark()

  const colorBorder = isDark
    ? typeof semanticColors.dark.default === 'string'
      ? semanticColors.dark.default
      : semanticColors.dark.default.DEFAULT
    : typeof semanticColors.light.default === 'string'
      ? semanticColors.light.default
      : semanticColors.light.default.DEFAULT

  // const colorPrimary = isDark
  //   ? typeof semanticColors.dark.primary === 'string'
  //     ? semanticColors.dark.primary
  //     : semanticColors.dark.primary.DEFAULT
  //   : typeof semanticColors.light.primary === 'string'
  //     ? semanticColors.light.primary
  //     : semanticColors.light.primary.DEFAULT

  return (
    <AntdConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        // token: {},
        components: {
          Tree: {
            lineWidth: 2,
            borderRadius: 8,
            colorBorder,
            algorithm: true,
          },
        },
      }}
    >
      {children}
    </AntdConfigProvider>
  )
}
