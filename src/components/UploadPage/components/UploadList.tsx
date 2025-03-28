import {
  actInsertPublicBookmark,
  actInsertUserBookmark,
  actTryCreatePublicTags,
  actTryCreateUserTags,
} from '@/actions'
import { Favicon, ReButton, ReTooltip } from '@/components'
import { InsertPublicBookmark } from '@/controllers'
import { usePageUtil } from '@/hooks'
import { runAction } from '@/utils'
import { concurrenceWithLimit } from '@/utils/concurrence-with-limit'
import { FieldConstraints, IconNames, PageRoutes } from '@cfg'
import { addToast, cn, Divider, Link, ScrollShadow } from '@heroui/react'
import { useSetState } from 'ahooks'
import { pick } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { Bookmark } from '..'
import { LinkTagStrategy } from '../common'
import Panel from './Panel'

interface Props {
  tagNames: string[]
  bookmarks: Bookmark[]
  linkTagStrategy: LinkTagStrategy
  onCancel(): void
}

enum UploadState {
  INVALID,
  WAIT,
  SUCCESS,
  FAILED,
}

function getDefaultFavicon(url: string) {
  return `https://favicon.yandex.net/favicon/${new URL(url).host}`
}

export default function UploadList(props: Props) {
  const isAdminSpace = usePageUtil().isAdminSpace
  const { linkTagStrategy, tagNames } = props
  const [state, setState] = useSetState({
    uploading: false,
  })
  const [bookmarks, setBookmarks] = useState(() => {
    return props.bookmarks
      .map((bookmark) => {
        const entity = {
          ...pick(bookmark, 'id', 'name', 'url'),
          icon: getDefaultFavicon(bookmark.url),
          relatedTagNames: [] as string[],
          state: UploadState.WAIT,
          errorMsg: '',
        }
        const isOversizeUrl = entity.url.length > FieldConstraints.MaxLen.URL
        const isOversizeName = entity.name.length > FieldConstraints.MaxLen.BOOKMARK_NAME
        if (isOversizeUrl || isOversizeName) {
          entity.state = UploadState.INVALID
          const errs = [
            isOversizeName &&
              `名称超过了 ${FieldConstraints.MaxLen.BOOKMARK_NAME} 个字符，过长的名称难以辨识，请考虑简化`,
            isOversizeUrl && `URL 长度不能超过 ${FieldConstraints.MaxLen.URL}`,
          ].filter(Boolean) as string[]
          entity.errorMsg = errs.join('；')
          return entity
        }
        if (linkTagStrategy === LinkTagStrategy.FOLDER_PATH) {
          for (const cate of bookmark.categories) {
            const tag = tagNames.find((t) => t === cate.name)
            if (!tag) continue
            entity.relatedTagNames.push(tag)
          }
        } else if (linkTagStrategy === LinkTagStrategy.CLOSED_FOLDER) {
          for (const cate of bookmark.categories.toReversed()) {
            const tag = tagNames.find((t) => t === cate.name)
            if (!tag) continue
            entity.relatedTagNames = [tag]
            break
          }
        }
        if (!entity.relatedTagNames.length) {
          entity.relatedTagNames = ['其它']
        }
        return entity
      })
      .sort((a, b) => {
        if (a.state === UploadState.INVALID && b.state !== UploadState.INVALID) return -1
        return 0
      })
  })
  const scroller = useRef<HTMLDivElement>(null)

  const totalNum = bookmarks.length
  const invalidNum = bookmarks.filter((b) => b.state === UploadState.INVALID).length
  const successNum = bookmarks.filter((b) => b.state === UploadState.SUCCESS).length
  const failedNum = bookmarks.filter((b) => b.state === UploadState.FAILED).length
  const waitNum = totalNum - invalidNum - successNum - failedNum
  // 任务没有开始
  const pending = !successNum && !failedNum
  const finished = !waitNum

  async function submit() {
    if (!waitNum) {
      addToast({
        color: 'warning',
        title: '没有可上传的任务',
      })
      return
    }
    const actCreateTags = isAdminSpace ? actTryCreatePublicTags : actTryCreateUserTags
    const res = await runAction(actCreateTags(tagNames))
    if (!res.ok) return
    const tags = res.data
    let failedNum = 0
    let successNum = 0
    const insertBookmark = isAdminSpace ? actInsertPublicBookmark : actInsertUserBookmark
    const tasks = bookmarks.map((bookmark) => async () => {
      if (bookmark.state === UploadState.INVALID) return
      const entity: InsertPublicBookmark = {
        ...pick(bookmark, 'name', 'url', 'icon'),
        relatedTagIds: bookmark.relatedTagNames.map(
          (name) => tags.find((t) => t.name === name)!.id
        ),
      }
      const res = await insertBookmark(entity)
      res.error ? failedNum++ : successNum++
      setBookmarks((bookmarks) => {
        const b = bookmarks.find((_bookmark) => _bookmark.id === bookmark.id)!
        if (res.error) {
          b.state = UploadState.FAILED
          b.errorMsg = res.error.msg
        } else {
          b.state = UploadState.SUCCESS
        }
        return [...bookmarks]
      })
    })
    setState({ uploading: true })
    await concurrenceWithLimit({ tasks })
    setState({ uploading: false })
    addToast({
      color: 'success',
      title: `任务已完成，成功 ${successNum} 个，失败 ${failedNum} 个`,
    })
  }

  useEffect(() => {
    if (!finished) return
    setBookmarks((bookmarks) => {
      setTimeout(() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' }))
      return bookmarks.toSorted((a, b) => {
        if (a.state === UploadState.FAILED && b.state === UploadState.SUCCESS) return -1
        return 0
      })
    })
  }, [finished])

  return (
    <Panel>
      <div className="gap-4 flex-items-center">
        <h2 className="mr-auto gap-2 flex-center">
          <span className={cn('text-xl', IconNames.Huge.LIST)} />
          <span>上传列表</span>
        </h2>
        <ReButton size="sm" onClick={props.onCancel} className={cn(!pending && 'hidden')}>
          返回
        </ReButton>
        <ReButton
          size="sm"
          color="primary"
          onClick={submit}
          className={cn(finished && 'hidden', 'px-6')}
        >
          {pending ? '🚀 开始上传' : '上传中'}
        </ReButton>
        <Link
          size="sm"
          className={cn(!finished && 'hidden')}
          onPress={() => globalThis.history?.go()}
        >
          继续上传
        </Link>
        <Link
          showAnchorIcon
          isExternal
          size="sm"
          className={cn(!finished && 'hidden')}
          onClick={(evt) => {
            evt.preventDefault()
            if (isAdminSpace) {
              window.open(PageRoutes.Admin.bookmarkSlug('list'))
              window.open(PageRoutes.INDEX)
            } else {
              window.open(PageRoutes.User.bookmarkSlug('list'))
              window.open(PageRoutes.User.INDEX)
            }
          }}
        >
          去查看
        </Link>
      </div>
      <Divider className="my-4" />
      <ScrollShadow
        style={{ maxHeight: 'calc(100vh - 390px)' }}
        className="-mr-6 pr-6"
        ref={scroller}
      >
        <div className="space-y-4 overflow-auto">
          {bookmarks.map((bookmark) => {
            return (
              <section key={bookmark.id} className="gap-4 flex-items-center">
                <Favicon src={bookmark.icon} size={24} showErrorIconOnFailed showSpinner />
                <a
                  className={cn(
                    'grow-0 truncate text-foreground-500 hover:opacity-70',
                    bookmark.state === UploadState.INVALID && 'opacity-70'
                  )}
                  target="_blank"
                  href={bookmark.url}
                >
                  {bookmark.name}
                </a>
                {bookmark.relatedTagNames.map((tag) => (
                  <span
                    key={tag}
                    className="shrink-0 rounded-xl bg-foreground-200/50 px-3 py-1 text-xs text-foreground-500 light:bg-foreground-200"
                  >
                    {tag}
                  </span>
                ))}
                <span className="ml-auto text-base flex-center">
                  {bookmark.state === UploadState.INVALID && (
                    <ReTooltip
                      content={
                        <div className="max-w-56 text-xs">
                          <p>当前书签不会被上传：{bookmark.errorMsg}</p>
                        </div>
                      }
                    >
                      <span className="icon-[tabler--alert-circle] cursor-pointer text-warning-500" />
                    </ReTooltip>
                  )}
                  {bookmark.state === UploadState.WAIT && state.uploading && (
                    <span className="icon-[tabler--loader-2] animate-spin cursor-wait text-foreground-500" />
                  )}
                  {bookmark.state === UploadState.SUCCESS && (
                    <span className="icon-[tabler--check] text-success-500" />
                  )}
                  {bookmark.state === UploadState.FAILED && (
                    <ReTooltip content={bookmark.errorMsg}>
                      <span className="icon-[tabler--x] cursor-pointer text-danger-400" />
                    </ReTooltip>
                  )}
                </span>
              </section>
            )
          })}
        </div>
      </ScrollShadow>
      <Divider className="my-4" />
      <div className="text-sm text-foreground-500">
        {(() => {
          return (
            <>
              共 {totalNum} 个书签，其中：
              <span hidden={!invalidNum}>
                <span className="text-warning-500">{invalidNum} </span>
                个无效，
              </span>
              <span hidden={!waitNum}>
                <span className="text-primary-500">{waitNum} </span>
                个待上传
                {!pending && '，'}
              </span>
              <span hidden={pending}>
                <span className="text-success-500">{successNum} </span>个上传成功，
                <span className="text-danger-400">{failedNum} </span>个上传失败
              </span>
            </>
          )
        })()}
      </div>
    </Panel>
  )
}
