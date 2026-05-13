'use client'

import { actGetSiteProxyConfig, actSaveSiteProxyConfig } from '@/actions'
import { AdminSurfaceCard } from '@/components/AdminPageShell'
import AdminPageTitle from '@/components/AdminPageTitle'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import { runAction } from '@/utils/client'
import { IconNames, PageRoutes } from '@cfg'
import { addToast } from '@heroui/react'
import { useRequest } from 'ahooks'
import { useState } from 'react'

export default function Page() {
  const [proxyUrl, setProxyUrl] = useState('')

  const { loading } = useRequest(async () => {
    const res = await runAction(actGetSiteProxyConfig())
    if (res.ok) {
      setProxyUrl(res.data.proxyUrl)
    }
  })

  async function save() {
    const trimmed = proxyUrl.trim()
    if (trimmed && !trimmed.includes('{url}')) {
      addToast({
        color: 'warning',
        title: '格式错误',
        description: '代理地址必须包含 {url} 占位符',
      })
      return
    }
    await runAction(actSaveSiteProxyConfig({ proxyUrl: trimmed }), {
      okMsg: '配置已保存',
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <AdminPageTitle title="网站设置" pathname={PageRoutes.Admin.SITE_SETTING} />

      <AdminSurfaceCard bodyClassName="p-5 sm:p-6">
        <div>
          <h3 className="text-lg font-semibold">网络代理</h3>
          <p className="text-default-500 mt-1 text-sm">
            配置后，获取网页内容和检测站点可用性时将通过代理访问。
          </p>
        </div>
        <br />
        <ReInput
          label="代理地址"
          placeholder="https://example.com/proxy?url={url}"
          description="使用 {url} 作为目标地址的占位符，例如 https://example.com/proxy?url={url}"
          isClearable
          value={proxyUrl}
          onValueChange={setProxyUrl}
        />

        <div className="mt-4 flex items-center gap-3">
          <ReButton
            color="primary"
            isLoading={loading}
            startContent={<span className={IconNames.Tabler.CHECK} />}
            onClick={save}
          >
            保存
          </ReButton>
        </div>
      </AdminSurfaceCard>
    </div>
  )
}
