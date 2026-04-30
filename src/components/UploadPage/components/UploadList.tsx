import {
  actInsertPublicBookmark,
  actInsertUserBookmark,
  actTryCreatePublicTags,
  actTryCreateUserTags,
} from '@/actions'
import Favicon from '@/components/Favicon'
import ReButton from '@/components/re-export/ReButton'
import ReTooltip from '@/components/re-export/ReTooltip'
import { InsertPublicBookmark } from '@/controllers'
import { usePageUtil } from '@/hooks'
import { runAction } from '@/utils/client'
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

enum UploadStatus {
  INVALID,
  WAIT,
  SUCCESS,
  FAILED,
  TRUNCATED,
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
          status: UploadStatus.WAIT,
          tip: '',
        }
        if (entity.url.length > FieldConstraints.MaxLen.URL) {
          entity.status = UploadStatus.INVALID
          entity.tip = `URL 长度不能超过 ${FieldConstraints.MaxLen.URL}`
          return entity
        }
        if (entity.name.length > FieldConstraints.MaxLen.BOOKMARK_NAME) {
          entity.name = entity.name.substring(0, FieldConstraints.MaxLen.BOOKMARK_NAME)
          entity.status = UploadStatus.TRUNCATED
          entity.tip = `名称超过了 ${FieldConstraints.MaxLen.BOOKMARK_NAME} 个字符，已自动截断`
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
        // 排序：INVALID -> TRUNCATED -> 其他
        if (a.status === UploadStatus.INVALID && b.status !== UploadStatus.INVALID) return -1
        if (
          a.status === UploadStatus.TRUNCATED &&
          b.status !== UploadStatus.INVALID &&
          b.status !== UploadStatus.TRUNCATED
        )
          return -1
        return 0
      })
  })
  const scroller = useRef<HTMLDivElement>(null)

  const totalNum = bookmarks.length
  const invalidNum = bookmarks.filter((b) => b.status === UploadStatus.INVALID).length
  const truncatedNum = bookmarks.filter((b) => b.status === UploadStatus.TRUNCATED).length
  const successNum = bookmarks.filter((b) => b.status === UploadStatus.SUCCESS).length
  const failedNum = bookmarks.filter((b) => b.status === UploadStatus.FAILED).length
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

    // 先把所有 TRUNCATED 书签置为 WAIT 状态
    const newBookmarks = bookmarks.map((bookmark) => {
      if (bookmark.status === UploadStatus.TRUNCATED) {
        bookmark.status = UploadStatus.WAIT
      }
      return bookmark
    })
    setBookmarks(newBookmarks)

    // 开始上传书签
    const actCreateTags = isAdminSpace ? actTryCreatePublicTags : actTryCreateUserTags
    const res = await runAction(actCreateTags(tagNames))
    if (!res.ok) return
    const tags = res.data as SelectTag[]
    let failedNum = 0
    let successNum = 0
    const insertBookmark = isAdminSpace ? actInsertPublicBookmark : actInsertUserBookmark
    const tasks = newBookmarks.map((bookmark) => async () => {
      if (bookmark.status === UploadStatus.INVALID) return
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
          b.status = UploadStatus.FAILED
          b.tip = res.error.msg
        } else {
          b.status = UploadStatus.SUCCESS
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
      // 让失败的排在前面
      return [...bookmarks].sort((a, b) => {
        if (a.status === UploadStatus.FAILED && b.status === UploadStatus.SUCCESS) return -1
        return 0
      })
    })
  }, [finished])

  return (
    <Panel>
      <div className="flex-items-center gap-4">
        <h2 className="flex-center mr-auto gap-2">
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
              window.open(PageRoutes.User.SPACE)
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
              <section key={bookmark.id} className="flex-items-center gap-4">
                <Favicon src={bookmark.icon} size={24} showErrorIconOnFailed showSpinner />
                <a
                  className={cn(
                    'text-foreground-500 grow-0 truncate hover:opacity-70',
                    bookmark.status === UploadStatus.INVALID && 'opacity-70'
                  )}
                  target="_blank"
                  href={bookmark.url}
                >
                  {bookmark.name}
                </a>
                {bookmark.relatedTagNames.map((tag) => (
                  <span
                    key={tag}
                    className="bg-foreground-200/50 text-foreground-500 light:bg-foreground-200 shrink-0 rounded-xl px-3 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
                <span className="flex-center ml-auto text-base">
                  {bookmark.status === UploadStatus.INVALID && (
                    <ReTooltip
                      content={`当前书签不会被上传：${bookmark.tip}`}
                      classNames={{ content: 'max-w-56 text-xs' }}
                    >
                      <span
                        className={cn(
                          IconNames.Tabler.ALERT_CIRCLE,
                          'text-warning-500 cursor-pointer'
                        )}
                      />
                    </ReTooltip>
                  )}
                  {bookmark.status === UploadStatus.TRUNCATED && (
                    <ReTooltip content={bookmark.tip} classNames={{ content: 'max-w-56 text-xs' }}>
                      <span
                        className={cn(
                          IconNames.Tabler.ALERT_TRIANGLE,
                          'text-warning-500 cursor-pointer'
                        )}
                      />
                    </ReTooltip>
                  )}
                  {bookmark.status === UploadStatus.WAIT && state.uploading && (
                    <span
                      className={cn(
                        IconNames.Tabler.LOADER_2,
                        'text-foreground-500 animate-spin cursor-wait'
                      )}
                    />
                  )}
                  {bookmark.status === UploadStatus.SUCCESS && (
                    <span className={cn(IconNames.Tabler.CHECK, 'text-success-500')} />
                  )}
                  {bookmark.status === UploadStatus.FAILED && (
                    <ReTooltip content={bookmark.tip}>
                      <span className={cn(IconNames.Tabler.X, 'text-danger-400 cursor-pointer')} />
                    </ReTooltip>
                  )}
                </span>
              </section>
            )
          })}
        </div>
      </ScrollShadow>
      <Divider className="my-4" />
      <div className="text-foreground-500 text-sm">
        共 {totalNum} 个书签，其中：
        <span hidden={!invalidNum}>
          <span className="text-warning-500">{invalidNum} </span>
          个无效，
        </span>
        <span hidden={!truncatedNum || !pending}>
          <span className="text-warning-500">{truncatedNum} </span>
          个已截断，
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
      </div>
    </Panel>
  )
}
