'use client'

import {
  actAnalyzeWebsite,
  actExtractHtmlInfo,
  actInsertPublicBookmark,
  actInsertUserBookmark,
  actUpdatePublicBookmark,
  actUpdateUserBookmark,
} from '@/actions'
import BookmarkIconDropdown from '@/components/BookmarkIconDropdown'
import Favicon from '@/components/Favicon'
import ReInput from '@/components/re-export/ReInput'
import ReTextarea from '@/components/re-export/ReTextarea'
import SlugPageLayout from '@/components/SlugPageLayout'
import TagSelect from '@/components/TagSelect'
import { InsertPublicBookmark } from '@/controllers'
import { usePageUtil, useSlug } from '@/hooks'
import { z } from '@/lib/zod'
import { runAction } from '@/utils/client'
import { FieldConstraints, IconNames, PageRoutes } from '@cfg'
import {
  Button,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Switch,
} from '@heroui/react'
import { useSetState, useUpdateEffect } from 'ahooks'
import { useRouter } from 'next/navigation'
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
  afterSave: () => Promise<void>
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
  const [state, setState] = useSetState({
    loading: false,
  })
  const hasValidUrl = !!bookmark.url && !invalidInfos.url

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
      .map((key) => validateItem(key as keyof typeof invalidInfos))
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
    setBookmark({
      name: data.title,
      icon: data.favicon,
      description: data.description,
      relatedTagIds: props.tags.filter((tag) => data.tags.includes(tag.name)).map((tag) => tag.id),
    })
  }

  useUpdateEffect(() => {
    props.bookmark && setBookmark({ ...props.bookmark })
  }, [props.bookmark])

  useUpdateEffect(() => {
    if (!state.loading) {
      validateAll()
    }
  }, [state.loading])

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
      async onOk() {
        await props.afterSave()
        const route = pageUtil.isAdminSpace
          ? PageRoutes.Admin.bookmarkSlug('list')
          : PageRoutes.User.bookmarkSlug('list')
        router.push(route)
        console.log({ route })
      },
    })
  }

  function renderParseWebsiteDropdown() {
    return (
      <Dropdown placement="right-start">
        <DropdownTrigger>
          <Button
            isIconOnly
            size="sm"
            isLoading={state.loading}
            className={cn('bg-transparent text-xl', !hasValidUrl && 'scale-0')}
          >
            <span
              className={cn('bg-linear-to-r from-pink-500 to-violet-500', IconNames.Mdi.STARS)}
            />
          </Button>
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

  return (
    <SlugPageLayout onSave={onSave} title={slug.isNew ? '新建书签' : '编辑书签'}>
      <ReInput
        label="网址"
        type="url"
        isRequired
        maxLength={FieldConstraints.MaxLen.URL}
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
        maxLength={FieldConstraints.MaxLen.TAG_NAME}
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
            <Favicon className="ml-1.5" src={bookmark.icon} showSpinner showErrorIconOnFailed />
          ) : (
            <span className="w-1.5" />
          )
        }
        endContent={
          <BookmarkIconDropdown url={bookmark.url} onSelectIcon={(icon) => setBookmark({ icon })} />
        }
      />
      <ReTextarea
        label="描述"
        maxLength={FieldConstraints.MaxLen.BOOKMARK_DESC}
        value={bookmark.description || ''}
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
      <div className="flex-items-center justify-between">
        <label className="text-sm">置顶书签</label>
        <Switch
          isSelected={bookmark.isPinned || false}
          onValueChange={(v) => setBookmark({ isPinned: v })}
        />
      </div>
    </SlugPageLayout>
  )
}
