import {
  actInsertPublicBookmark,
  actInsertUserBookmark,
  actTryCreatePublicTags,
  actTryCreateUserTags,
} from '@/actions'
import { Favicon, ReButton, ReTooltip } from '@/components'
import { InsertPublicBookmark } from '@/controllers'
import { usePageUtil } from '@/hooks'
import { concurrenceWithLimit } from '@/utils/concurrence-with-limit'
import { IconNames, PageRoutes } from '@cfg'
import { addToast, cn, Divider, Link, ScrollShadow } from '@heroui/react'
import { useSetState } from 'ahooks'
import { pick } from 'lodash'
import { useEffect, useState } from 'react'
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
  WAIT,
  UPLOADING,
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
    finishedNum: null as null | number,
  })
  const [bookmarks, setBookmarks] = useState(() => {
    return props.bookmarks.map((bookmark) => {
      const entity = {
        id: bookmark.name,
        icon: getDefaultFavicon(bookmark.url),
        name: bookmark.name,
        url: bookmark.url,
        relatedTagNames: [] as string[],
        state: UploadState.WAIT,
        errorMsg: '',
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
  })

  async function submit() {
    const action = isAdminSpace ? actTryCreatePublicTags : actTryCreateUserTags
    const { data: tags } = await action(tagNames)
    if (!tags) return
    const otherTagId = tags.find((tag) => tag.name === '其它')?.id
    if (!otherTagId) throw new Error('数据异常')
    const insertBookmark = isAdminSpace ? actInsertPublicBookmark : actInsertUserBookmark
    const tasks = bookmarks.map((bookmark) => async () => {
      const entity: InsertPublicBookmark = {
        ...pick(bookmark, 'name', 'url', 'icon'),
        relatedTagIds: bookmark.relatedTagNames.map(
          (name) => tags.find((t) => t.name === name)!.id
        ),
      }
      const res = await insertBookmark(entity)
      setState((state) => ({ ...state, finishedNum: (state.finishedNum || 0) + 1 }))
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
    await concurrenceWithLimit({ tasks })
  }

  useEffect(() => {
    if (state.finishedNum === bookmarks.length) {
      addToast({
        color: 'success',
        title: '任务已完成',
      })
    }
  }, [state.finishedNum, bookmarks.length])

  return (
    <Panel>
      <div className="gap-4 flex-items-center">
        <h2 className="mr-auto w-full text-xl">
          {(() => {
            if (state.finishedNum === null) {
              return (
                <div className="gap-2 flex-items-center">
                  <span className={cn('text-xl', IconNames.Huge.LIST)} />
                  <span>上传列表</span>
                </div>
              )
            }
            if (state.finishedNum === bookmarks.length) {
              return (
                <div className="flex w-full items-center justify-between gap-4">
                  <span>任务已完成</span>
                  <Link
                    className="cursor-pointer"
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
                    showAnchorIcon
                    isExternal
                    size="sm"
                  >
                    去查看
                  </Link>
                </div>
              )
            }
            return `上传进度 ${state.finishedNum} / ${bookmarks.length}`
          })()}
        </h2>
        <ReButton
          size="sm"
          onClick={props.onCancel}
          className={cn(state.finishedNum !== null && 'hidden')}
        >
          返回
        </ReButton>
        <ReButton
          size="sm"
          color="primary"
          onClick={submit}
          className={cn(state.finishedNum !== null && 'hidden', 'px-6')}
        >
          🚀 开始上传
        </ReButton>
      </div>
      <Divider className="my-4" />
      <ScrollShadow style={{ maxHeight: 'calc(100vh - 360px)' }} className="-mr-6 pr-6">
        <div className="space-y-4 overflow-auto">
          {bookmarks.map((bookmark) => {
            return (
              <section key={bookmark.id} className="gap-4 flex-items-center">
                <Favicon src={bookmark.icon} size={24} />
                <a
                  className="grow-0 truncate text-foreground-500 hover:opacity-70"
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
                <span className="ml-auto cursor-pointer text-base">
                  {bookmark.state === UploadState.UPLOADING && (
                    <ReTooltip content="上传中">
                      <span className="icon-[tabler--loader-2] animate-spin text-foreground-500" />
                    </ReTooltip>
                  )}
                  {bookmark.state === UploadState.SUCCESS && (
                    <ReTooltip content="上传成功">
                      <span className="icon-[tabler--check] text-success-500" />
                    </ReTooltip>
                  )}
                  {bookmark.state === UploadState.FAILED && (
                    <ReTooltip content={bookmark.errorMsg}>
                      <span className="icon-[tabler--x] text-danger-400" />
                    </ReTooltip>
                  )}
                </span>
              </section>
            )
          })}
        </div>
      </ScrollShadow>
    </Panel>
  )
}
