import { AppBackground } from '@/components/AppBackground'
import '@/globals.css'
import { auth } from '@/lib/auth'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { WEBSITE_KEYWORDS } from '@cfg'
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { GlobalProvider } from './ctx'

// 禁止动态缓存这个 RSC；还可以通过 ISR 增量更新
// https://nextjs.org/docs/app/building-your-application/data-fetching/fetching
// https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration
// export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  description:
    'BMM - 你的智能书签管家！支持 AI 解析网站信息，自动生成标签，跨设备同步书签。高效管理你的收藏夹，探索开发者精选资源，支持明暗双主题与多端适配。',
  icons: '/logo.svg',
  applicationName: 'BMM 书签管家',
  authors: { name: '令川', url: 'https://lccl.cc' },
  keywords: WEBSITE_KEYWORDS,
  robots: { index: true, follow: true },
  other: {
    ...(process.env.BAIDU_SITE_VERIFICATION && {
      'baidu-site-verification': process.env.BAIDU_SITE_VERIFICATION,
    }),
  },
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await auth()

  return (
    <html
      lang="en"
      className="min-w-[350px] bg-background text-foreground"
      suppressHydrationWarning
    >
      <body>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
        {process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID && (
          <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID} />
        )}
        <AppBackground />
        <GlobalProvider session={session}>
          <AntdRegistry>{children}</AntdRegistry>
        </GlobalProvider>
      </body>
    </html>
  )
}
