'use client'

import {
  actAnalyzeWebsite,
  actExtractHtmlInfo,
  actInsertPublicBookmark,
  actInsertUserBookmark,
  actUpdatePublicBookmark,
  actUpdateUserBookmark,
} from '@/actions'
import { Favicon, ReButton, ReInput, ReTextarea, SlugPageLayout, TagSelect } from '@/components'
import { InsertPublicBookmark } from '@/controllers'
import { usePageUtil, useSlug } from '@/hooks'
import { z } from '@/lib/zod'
import { isValidUrl, runAction } from '@/utils'
import { IconNames, PageRoutes } from '@cfg'
import {
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Switch,
} from '@heroui/react'
import { useSetState, useUpdateEffect } from 'ahooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { fromZodError } from 'zod-validation-error'

const formSchema = z.object({
  url: z.string().min(1, { message: '请输入 URL' }).url({ message: '请输入有效的 URL' }),
  name: z.string().min(1, { message: '请输入名称' }),
  icon: z
    .string()
    .url({ message: '请输入有效的图标地址' })
    .or(z.string().refine((v) => !v)),
})

type Bookmark = Pick<
  InsertPublicBookmark,
  'url' | 'name' | 'icon' | 'description' | 'relatedTagIds' | 'isPinned'
>

export interface BookmarkSlugPageProps {
  bookmark: SelectBookmark | null
  tags: SelectTag[]
  afterSave: () => void
}

export default function BookmarkSlugPage(props: BookmarkSlugPageProps) {
  const slug = useSlug()
  const pageUtil = usePageUtil()
  const router = useRouter()
  const [bookmark, setBookmark] = useSetState<Bookmark>({
    url: '',
    name: '',
    icon: '',
    description: '',
    relatedTagIds: [],
    isPinned: false,
  })

  const [invalidInfos, setInvalidInfos] = useSetState<z.infer<typeof formSchema>>({
    url: '',
    name: '',
    icon: '',
  })

  const [state, setState] = useState({ loading: false })

  useUpdateEffect(() => {
    props.bookmark && setBookmark({ ...props.bookmark })
  }, [props.bookmark])

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
    const res = await runAction(actExtractHtmlInfo(bookmark.url))
    setState({ loading: false })
    if (!res.ok) return
    setBookmark(res.data)
  }

  async function aiAnalyzeWebsite() {
    setState({ loading: true })
    const { data } = await runAction(actAnalyzeWebsite(bookmark.url))
    setState({ loading: false })
    if (!data) return
    process.env.NODE_ENV === 'development' && console.log('AI 解析结果：', data)
    setBookmark({
      name: data.title,
      icon: data.favicon,
      description: data.description,
      relatedTagIds: props.tags.filter((tag) => data.tags.includes(tag.name)).map((tag) => tag.id),
    })
  }
  async function onSave() {
    if (!validateAll()) return
    const action = slug.isNew
      ? pageUtil.isAdminSpace
        ? actInsertPublicBookmark(bookmark)
        : actInsertUserBookmark(bookmark)
      : pageUtil.isAdminSpace
        ? actUpdatePublicBookmark({ ...bookmark, id: slug.number! })
        : actUpdateUserBookmark({ ...bookmark, id: slug.number! })
    await runAction(action, {
      okMsg: slug.isNew ? '书签已创建' : '书签已更新',
      onOk() {
        router.push((pageUtil.isAdminSpace ? PageRoutes.Admin : PageRoutes.User).BOOKMARK_LIST)
        props.afterSave()
      },
    })
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
            className={cn('bg-transparent text-xl', !hasValidUrl && 'scale-0')}
          >
            <span className={cn('bg-gradient-to-r from-pink-500 to-violet-500', IconNames.STARS)} />
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
            className={cn('bg-transparent', !hasValidUrl && 'scale-0')}
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
          tags={props.tags}
          value={bookmark.relatedTagIds}
          onChange={(v) => setBookmark({ relatedTagIds: v })}
        />
      </div>
      <div className="justify-between flex-items-center">
        <label className="text-sm">置顶书签</label>
        <Switch
          isSelected={bookmark.isPinned || false}
          onValueChange={(v) => setBookmark({ isPinned: v })}
        />
      </div>
    </SlugPageLayout>
  )
}
