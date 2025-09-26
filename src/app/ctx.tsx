'use client'

import useIsDark from '@/hooks/useIsDark'
import { PageRoutes } from '@cfg'
import { HeroUIProvider, semanticColors, ToastProvider } from '@heroui/react'
import { ConfigProvider as AntdConfigProvider, theme as antdTheme, ThemeConfig } from 'antd'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

// 全局上下文（先占个坑）
interface GlobalContextType {}

const GlobalContext = createContext<GlobalContextType | null>(null)

export function useGlobalContext() {
  const ctx = useContext(GlobalContext)
  if (!ctx) throw new Error('useGlobalContext must be used within a GlobalContextProvider')
  return ctx
}

function AntdConfigProviderWrapper({ children }: PropsWithChildren) {
  const isDark = useIsDark()

  const theme = useMemo<ThemeConfig>(() => {
    const colorBorder = isDark
      ? typeof semanticColors.dark.default === 'string'
        ? semanticColors.dark.default
        : semanticColors.dark.default.DEFAULT
      : typeof semanticColors.light.default === 'string'
        ? semanticColors.light.default
        : semanticColors.light.default.DEFAULT
    return {
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      components: { Tree: { lineWidth: 2, borderRadius: 8, colorBorder, algorithm: true } },
    }
  }, [isDark])

  return <AntdConfigProvider theme={theme}>{children}</AntdConfigProvider>
}

interface Props {
  session: Session | null
}
export function GlobalProvider(props: PropsWithChildren<Props>) {
  const pathname = usePathname()
  useReportWebVitals((metric) => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) return
    // @ts-ignore
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value), // values must be integers
      event_label: metric.id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    })
  })

  const ctxValue = useMemo<GlobalContextType>(() => ({}), [])
  const forceTheme = pathname === PageRoutes.LOGIN ? 'light' : undefined

  return (
    <GlobalContext.Provider value={ctxValue}>
      <HeroUIProvider>
        <ToastProvider
          placement="top-center"
          toastOffset={20}
          toastProps={{ timeout: 3000, radius: 'lg' }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme={forceTheme}>
          <AntdConfigProviderWrapper>
            <SessionProvider session={props.session}>{props.children}</SessionProvider>
          </AntdConfigProviderWrapper>
        </ThemeProvider>
      </HeroUIProvider>
    </GlobalContext.Provider>
  )
}
