'use client'

import {
  actAnalyzeWebsite,
  actQueryPublicBookmark,
  actQueryUserBookmark,
  actInsertPublicBookmark,
  actInsertUserBookmark,
  actUpdatePublicBookmark,
  actUpdateUserBookmark,
} from '@/actions'
import AiAnalyzeButton from '@/components/AiAnalyzeButton'
import BookmarkIconDropdown from '@/components/BookmarkIconDropdown'
import Favicon from '@/components/Favicon'
import ReButton from '@/components/re-export/ReButton'
import ReInput from '@/components/re-export/ReInput'
import ReTextarea from '@/components/re-export/ReTextarea'
import SlugPageLayout from '@/components/SlugPageLayout'
import TagSelect from '@/components/TagSelect'
import { InsertPublicBookmark } from '@/controllers'
import { usePageUtil, useSlug } from '@/hooks'
import { z } from '@/lib/zod'
import { runAction } from '@/utils/client'
import { FieldConstraints, IconNames, PageRoutes } from '@cfg'
import { cn, Switch } from '@heroui/react'
import { useSetState } from 'ahooks'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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

function normalizeBookmarkInput(bookmark: Partial<Bookmark>): Bookmark {
  return {
    ...bookmark,
    url: bookmark.url ?? '',
    name: bookmark.name ?? '',
    icon: bookmark.icon ?? '',
    description: bookmark.description ?? '',
    relatedTagIds: bookmark.relatedTagIds ?? [],
    isPinned: bookmark.isPinned ?? false,
  }
}

export interface BookmarkSlugPageProps {
  tags: SelectTag[]
  refreshTags: () => Promise<void>
  afterSave: () => Promise<void>
}

export default function BookmarkSlugPage(props: BookmarkSlugPageProps) {
  const { refreshTags, tags } = props
  const slug = useSlug()
  const pageUtil = usePageUtil()
  const router = useRouter()
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    slug.isNew ? 'ready' : 'loading'
  )
  const [loadError, setLoadError] = useState('')
  const [previousBookmark, setPreviousBookmark] = useState<Bookmark | null>(null)

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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const hasValidUrl = formSchema.shape.url.safeParse(bookmark.url).success

  useEffect(() => {
    if (tags.length) return
    const handleFocus = () => {
      void refreshTags()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [tags.length, refreshTags])

  useEffect(() => {
    if (slug.isNew) return
    let active = true
    const action = pageUtil.isAdminSpace ? actQueryPublicBookmark : actQueryUserBookmark
    runAction(action({ id: slug.number! }), { errToast: { hidden: true } }).then((res) => {
      if (!active) return
      if (!res.ok || !res.data) {
        setLoadError(res.ok ? '书签不存在' : res.message)
        setLoadState('error')
        return
      }
      setBookmark(normalizeBookmarkInput(res.data))
      setLoadState('ready')
    })
    return () => {
      active = false
    }
  }, [slug.isNew, slug.number, pageUtil.isAdminSpace, setBookmark])

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

  async function aiAnalyzeWebsite() {
    if (!hasValidUrl || isAnalyzing) return
    const originalBookmark = { ...bookmark }
    setIsAnalyzing(true)
    const { data } = await runAction(actAnalyzeWebsite(bookmark.url)).finally(() => {
      setIsAnalyzing(false)
    })
    if (!data) return
    setPreviousBookmark(originalBookmark)
    setInvalidInfos({ name: '', icon: '' })
    setBookmark({
      name: data.title || '',
      icon: data.favicon || '',
      description: data.description || '',
      relatedTagIds: props.tags.filter((tag) => data.tags.includes(tag.name)).map((tag) => tag.id),
    })
  }

  async function onSave() {
    if (isAnalyzing || loadState !== 'ready') return
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

  if (loadState !== 'ready') {
    return (
      <div
        className="border-divider bg-content1 mx-auto max-w-4xl rounded-2xl border p-6"
        role="status"
      >
        <h1 className="text-xl font-semibold">
          {loadState === 'loading' ? '正在加载书签…' : '无法打开书签'}
        </h1>
        {loadState === 'error' && (
          <>
            <p className="text-default-600 my-4">{loadError}</p>
            <ReButton
              href={
                pageUtil.isAdminSpace
                  ? PageRoutes.Admin.bookmarkSlug('list')
                  : PageRoutes.User.bookmarkSlug('list')
              }
              color="primary"
            >
              返回书签列表
            </ReButton>
          </>
        )}
      </div>
    )
  }

  function renderAiButton(className?: string) {
    return (
      <AiAnalyzeButton
        isAnalyzing={isAnalyzing}
        isDisabled={!hasValidUrl}
        onAnalyze={aiAnalyzeWebsite}
        className={className}
      />
    )
  }

  return (
    <SlugPageLayout
      onSave={onSave}
      isSaveDisabled={isAnalyzing}
      title={slug.isNew ? '新建书签' : '编辑书签'}
    >
      <div className="flex flex-col gap-2">
        <ReInput
          label="网址"
          type="url"
          isReadOnly={isAnalyzing}
          isRequired
          maxLength={FieldConstraints.MaxLen.URL}
          isInvalid={!!invalidInfos.url}
          errorMessage={invalidInfos.url}
          classNames={{ inputWrapper: 'xs:pr-1' }}
          endContent={renderAiButton('hidden xs:inline-flex')}
          value={bookmark.url}
          onChange={(e) => {
            setBookmark({ url: e.target.value })
            setPreviousBookmark(null)
            setInvalidInfos({ url: '' })
          }}
          onBlur={() => validateItem('url')}
        />
        <div className="xs:hidden flex justify-end">{renderAiButton()}</div>
      </div>
      {(isAnalyzing || previousBookmark) && (
        <div role="status" aria-live="polite" className="text-default-600 text-sm">
          {isAnalyzing
            ? '正在解析网站，请稍候…'
            : previousBookmark && (
                <div className="xs:flex-row xs:items-center xs:gap-3 flex flex-col items-start gap-2">
                  <span>已填充网站信息，请确认后保存。</span>
                  <ReButton
                    variant="light"
                    size="sm"
                    className="xs:min-h-8 min-h-11"
                    onPress={() => {
                      setBookmark(previousBookmark)
                      setPreviousBookmark(null)
                    }}
                  >
                    撤销本次填充
                  </ReButton>
                </div>
              )}
        </div>
      )}
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
        value={bookmark.icon || ''}
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
        {props.tags.length ? (
          <TagSelect
            tags={props.tags}
            value={bookmark.relatedTagIds}
            onChange={(v) => setBookmark({ relatedTagIds: v })}
          />
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-default-600 text-sm leading-6">
              暂无标签，可先创建，当前填写内容会保留。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ReButton
                href={
                  pageUtil.isAdminSpace
                    ? PageRoutes.Admin.tagSlug('new')
                    : PageRoutes.User.tagSlug('new')
                }
                target="_blank"
                rel="noopener noreferrer"
                variant="flat"
                size="sm"
                className="xs:min-h-8 min-h-11"
                aria-label="新建标签（在新窗口打开）"
                endContent={
                  <span
                    className={cn(IconNames.Tabler.EXTERNAL_LINK, 'text-base')}
                    aria-hidden="true"
                  />
                }
              >
                新建标签
              </ReButton>
              <ReButton
                variant="light"
                size="sm"
                className="text-primary xs:min-h-8 min-h-11"
                onPress={props.refreshTags}
              >
                刷新标签
              </ReButton>
            </div>
          </div>
        )}
      </div>
      <div className="flex-items-center justify-between">
        <label className="text-sm">置顶书签</label>
        <Switch
          aria-label="置顶书签"
          isSelected={bookmark.isPinned || false}
          onValueChange={(v) => setBookmark({ isPinned: v })}
        />
      </div>
    </SlugPageLayout>
  )
}
