'use client'

import { useGlobalContext } from '@/app/ctx'
import Favicon from '@/components/Favicon'
import SlugPageLayout from '@/components/SlugPageLayout'
import TagSelect from '@/components/TagSelect'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import ReTextarea from '@/components/re-export/ReTextarea'
import { InsertPublicBookmark } from '@/controllers/PublicBookmark.controller'
import useSlug from '@/hooks/useSlug'
import http from '@/lib/http'
import { z } from '@/lib/zod'
import { isValidUrl } from '@/utils'
import { ApiRoutes, IconNames, PageRoutes } from '@cfg'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@heroui/react'
import { useSetState, useUpdateEffect } from 'ahooks'
import clsx from 'clsx'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { fromZodError } from 'zod-validation-error'

const formSchema = z.object({
  url: z.string().min(1, { message: '请输入 URL' }).url({ message: '请输入有效的 URL' }),
  name: z.string().min(1, { message: '请输入名称' }),
  icon: z
    .string()
    .url({ message: '请输入有效的图标地址' })
    .or(z.string().refine((v) => !v)),
})

export default function BookmarkSlug() {
  const [bookmark, setBookmark] = useSetState<InsertPublicBookmark>({
    url: '',
    name: '',
    icon: '',
    description: '',
    relatedTagIds: [],
  })

  const [invalidInfos, setInvalidInfos] = useSetState<z.infer<typeof formSchema>>({
    url: '',
    name: '',
    icon: '',
  })

  const [state, setState] = useState({ loading: false })

  const router = useRouter()

  const slug = useSlug()

  const { tags } = useGlobalContext()

  useUpdateEffect(() => {
    if (slug.number === null) return
    http.get(ApiRoutes.Public.BOOKMARK, { id: slug.number }).then(({ data, error }) => {
      if (error) return
      setBookmark(data)
    })
  }, [slug.number])

  function validateItem(key: keyof typeof invalidInfos) {
    const res = formSchema.shape[key].safeParse(bookmark[key])
    const info = res.success
      ? ''
      : fromZodError(res.error, { prefix: null, maxIssuesInMessage: 1 }).message
    setInvalidInfos((s) => ({ ...s, [key]: info }))
    return res.success
  }

  function validateAll() {
    return Object.keys(invalidInfos)
      .map((key) => validateItem(key as any))
      .every((v) => v)
  }

  async function parseWebsite() {
    setState({ loading: true })
    const res = await http.post(ApiRoutes.PARSE_WEBSITE, { url: bookmark.url })
    setState({ loading: false })
    if (res.data) {
      setBookmark({
        name: res.data.title,
        icon: res.data.icon,
        description: res.data.description,
      })
    }
  }

  async function aiAnalyzeWebsite() {
    setState({ loading: true })
    const { data } = await http.post(ApiRoutes.Ai.ANALYZE_WEBSITE, { url: bookmark.url })
    setState({ loading: false })
    if (!data) return
    process.env.NODE_ENV === 'development' && console.log('AI 解析结果：', data)
    setBookmark({
      name: data.title,
      icon: data.favicon,
      description: data.description,
      relatedTagIds: tags.filter((tag) => data.tags.includes(tag.name)).map((tag) => tag.id),
    })
  }

  async function onSave() {
    if (!validateAll()) return
    if (slug.isNew) {
      const { error } = await http.post(ApiRoutes.Public.BOOKMARK, { ...bookmark })
      if (error) return
      toast.success('创建成功')
      router.push(PageRoutes.Admin.BOOKMARK_LIST)
    } else {
      const { error } = await http.patch(ApiRoutes.Public.BOOKMARK, { ...bookmark })
      if (error) return
      toast.success('更新成功')
      router.back()
    }
  }

  useUpdateEffect(() => {
    !state.loading && validateAll()
  }, [state.loading])

  function renderParseWebsiteDropdown() {
    return (
      <Dropdown placement="right-start">
        <DropdownTrigger>
          <ReButton
            isIconOnly
            size="sm"
            isLoading={state.loading}
            className={clsx('bg-transparent text-xl', !hasValidUrl && 'scale-0')}
          >
            <span
              className={clsx('bg-gradient-to-r from-pink-500 to-violet-500', IconNames.STARS)}
            />
          </ReButton>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem key="parse" onClick={parseWebsite}>
            解析 HTML
          </DropdownItem>
          <DropdownItem key="ai" onClick={aiAnalyzeWebsite}>
            AI 智能解析
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    )
  }

  function renderIconDropdown() {
    if (!isValidUrl(bookmark.url)) return null
    const { host } = new URL(bookmark.url)
    const list = [
      { name: 'Google', src: 'https://www.google.com/s2/favicons?domain=' + host },
      { name: 'DuckDuckGo', src: `https://icons.duckduckgo.com/ip3/${host}.ico` },
      { name: 'Yandex', src: `https://favicon.yandex.net/favicon/${host}` },
      { name: '令川', src: 'https://api.lcll.cc/favicon?host=' + host },
      { name: 'Favicon.im', src: `https://favicon.im/${host}` },
      // { name: '一为', src: `https://api.iowen.cn/favicon/${host}.png` },
      // {
      //   name: '付之轻',
      //   src: `https://favicons.fuzqing.workers.dev/api/getFavicon?url=${host}&size=64`,
      // },
      { name: 'Xinac', src: `https://api.xinac.net/icon/?url=${host}` },
      // { name: '15777', src: `https://api.15777.cn/get.php?url=${host}` },
      // { name: '记磊工具箱', src: `https://tools.ly522.com/ico/favicon.php?url=${host}` },
      // { name: 'Qqsuu', src: `https://api.qqsuu.cn/api/dm-get?url=${host}` },
      // { name: 'Uomg', src: 'https://api.uomg.com/api/get.favicon?url=' + host },
      { name: '流浪猫', src: `https://api.cxr.cool/ico/?url=${host}` },
    ]
    return (
      <Dropdown placement="right-start">
        <DropdownTrigger>
          <ReButton
            isIconOnly
            size="sm"
            className={clsx('bg-transparent', !hasValidUrl && 'scale-0')}
          >
            <span className="icon-[tabler--api] text-2xl" />
          </ReButton>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownSection title="第三方 API 获取图标">
            {list.map((item) => (
              <DropdownItem
                key={item.name}
                textValue={item.name}
                onClick={() => setBookmark({ icon: item.src })}
              >
                <div className="justify-between flex-items-center">
                  <span>{item.name}</span>
                  <Favicon
                    size={20}
                    src={item.src}
                    canShowSpinner
                    className="border"
                    disableLazyLoading
                    showErrorIconOnFailed
                  />
                </div>
              </DropdownItem>
            ))}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
    )
  }

  const hasValidUrl = bookmark.url && !invalidInfos.url

  return (
    <SlugPageLayout onSave={onSave}>
      <ReInput
        label="网址"
        type="url"
        isRequired
        isInvalid={!!invalidInfos.url}
        errorMessage={invalidInfos.url}
        endContent={renderParseWebsiteDropdown()}
        value={bookmark.url}
        onChange={(e) => setBookmark({ url: e.target.value })}
        onBlur={() => validateItem('url')}
      />
      <ReInput
        label="名称"
        isRequired
        maxLength={30}
        isInvalid={!!invalidInfos.name}
        errorMessage={invalidInfos.name}
        value={bookmark.name}
        onValueChange={(v) => setBookmark({ name: v })}
        onBlur={() => validateItem('name')}
      />
      <ReInput
        label="图标地址"
        classNames={{ inputWrapper: 'pl-0' }}
        isInvalid={!!invalidInfos.icon}
        errorMessage={invalidInfos.icon}
        onBlur={() => validateItem('icon')}
        value={bookmark.icon!}
        onValueChange={(v) => setBookmark({ icon: v })}
        startContent={
          bookmark.icon ? (
            <Favicon className="ml-1.5" src={bookmark.icon} canShowSpinner showErrorIconOnFailed />
          ) : (
            <span className="w-1.5" />
          )
        }
        endContent={renderIconDropdown()}
      />
      <ReTextarea
        label="描述"
        value={bookmark.description!}
        onValueChange={(v) => setBookmark({ description: v })}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm">关联标签</label>
        <TagSelect
          value={bookmark.relatedTagIds}
          onChange={(v) => setBookmark({ relatedTagIds: v })}
        />
      </div>
    </SlugPageLayout>
  )
}
