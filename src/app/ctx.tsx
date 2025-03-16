'use client'

import { actGetAllPublicTags, actTotalPublicBookmarks } from '@/actions'
import useIsDark from '@/hooks/useIsDark'
import { runAction } from '@/utils'
import { Background, PageRoutes } from '@cfg'
import { cn, HeroUIProvider, semanticColors, ToastProvider } from '@heroui/react'
import { useSetState } from 'ahooks'
import { ConfigProvider as AntdConfigProvider, theme as antdTheme } from 'antd'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

export interface GlobalContextType {
  /** 所有的 publicTags  */
  tags: SelectTag[]
  /** publicBookmarks 个数 */
  totalBookmarks: number
  setCtxValue(fn: (value: ContextValuePart) => ContextValuePart): void
  /** 立即更新标签，并重新请求获取书签 */
  updateTags(tags?: SelectTag[]): Promise<void>
  /** 立即变更并重新获取书签个数 */
  updateTotalBookmarks(value: number): Promise<void>
}
type ContextValuePart = Pick<GlobalContextType, 'tags' | 'totalBookmarks'>

const GlobalContext = createContext<GlobalContextType | null>(null)

export function useGlobalContext() {
  const ctx = useContext(GlobalContext)
  if (!ctx) throw new Error('useGlobalContext must be used within a GlobalContextProvider')
  return ctx
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
  return (
    <AntdConfigProvider
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        components: { Tree: { lineWidth: 2, borderRadius: 8, colorBorder, algorithm: true } },
      }}
    >
      {children}
    </AntdConfigProvider>
  )
}

type Props = ContextValuePart & { session: Session | null }
export function GlobalProvider(props: PropsWithChildren<Props>) {
  const [state, setState] = useSetState({
    tags: props.tags,
    totalBookmarks: props.totalBookmarks,
  })
  const pathname = usePathname()
  // TODO
  if (!props.tags.length || !props.totalBookmarks) {
    if (pathname !== PageRoutes.LOGIN && !pathname.startsWith(PageRoutes.Admin.INDEX)) {
      // redirect(PageRoutes.LOGIN)
    }
  }

  useReportWebVitals((metric) => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) return
    // @ts-ignore
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value), // values must be integers
      event_label: metric.id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate.
    })
  })

  const ctxValue = useMemo<GlobalContextType>(() => {
    return {
      ...state,
      setCtxValue(fn) {
        setState((state) => fn(state))
      },
      async updateTags(tags) {
        if (tags) {
          tags = [...tags]
        }
        const oldValue = state.tags
        tags && setState({ tags })
        const res = await runAction(actGetAllPublicTags())
        setState({ tags: res.ok ? res.data : oldValue })
      },
      updateTotalBookmarks: async (value: number) => {
        const oldValue = state.totalBookmarks
        setState({ totalBookmarks: value })
        const res = await runAction(actTotalPublicBookmarks())
        setState({ totalBookmarks: res.ok ? res.data : oldValue })
      },
    }
  }, [state, setState])

  return (
    <GlobalContext.Provider value={ctxValue}>
      <div
        className={cn(
          'fixed -z-10 h-screen w-screen max-xs:hidden max-xs:dark:block',
          Background.CLASS
        )}
      >
        <div className="absolute left-[-12rem] top-[5rem] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.1),rgba(255,255,255,0))]" />
        <div className="absolute bottom-[-200px] right-[-200px] size-[50rem] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.1),rgba(255,255,255,0))]" />
      </div>
      <HeroUIProvider>
        <ToastProvider
          placement="top-center"
          toastOffset={20}
          toastProps={{ timeout: 3000, radius: 'lg' }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AntdConfigProviderWrapper>
            <SessionProvider session={props.session}>{props.children}</SessionProvider>
          </AntdConfigProviderWrapper>
        </ThemeProvider>
      </HeroUIProvider>
    </GlobalContext.Provider>
  )
}
