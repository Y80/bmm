'use client'

import { IconNames } from '@cfg'
import { Button, Divider, cn } from '@heroui/react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { PropsWithChildren } from 'react'
import AdminPageTitle from './AdminPageTitle'
import { AdminSurfaceCard } from './AdminPageShell'
import { ReButton } from './re-export'

interface Props {
  isSaving?: boolean
  onSave?: () => void
  onCancel?: () => void
  title?: string
  bodyClassName?: string
}

export default function SlugPageLayout(props: PropsWithChildren<Props>) {
  const { slug } = useParams<{ slug: string }>()
  const pathname = usePathname()
  const router = useRouter()
  const isCmsSpace = pathname.startsWith('/admin') || pathname.startsWith('/user')
  const pageName = pathname.includes('/tag') ? '标签' : '书签'
  const actionName = slug === 'new' ? '新建' : '编辑'
  const title = props.title || `${actionName}${pageName}`

  if (!isCmsSpace) {
    return (
      <div className="flex-items-center mx-auto w-md flex-col py-16">
        <h1 className="text-3xl">
          <span className="bg-foreground-200 text-foreground mr-4 rounded-xl px-4 py-1">
            {actionName}
          </span>
          <span>{pageName}</span>
        </h1>
        <Divider className="my-16" />
        <div role="form-box" className="mb-8 flex w-full flex-col gap-6">
          {props.children}
        </div>

        <Button
          className="mt-20 w-full"
          isLoading={props.isSaving}
          onPress={props.onCancel || router.back}
          startContent={<span className={cn(IconNames.Tabler.ARROW_BACK, 'text-xl')} />}
        >
          返 回
        </Button>
        <ReButton
          color="primary"
          className="mt-4 w-full shadow-lg"
          onClick={props.onSave}
          startContent={
            !props.isSaving && <span className={cn(IconNames.Tabler.DOWNLOAD, 'text-xl')} />
          }
        >
          保 存
        </ReButton>
      </div>
    )
  }

  return (
    <div className="xs:py-2 mx-auto w-full max-w-4xl py-1">
      <div className="pt-8 pb-9 sm:pt-10 sm:pb-11">
        <AdminPageTitle title={title} pathname={pathname} />
      </div>

      <AdminSurfaceCard bodyClassName={cn('p-5 sm:p-6', props.bodyClassName)}>
        <div role="form-box" className="mb-8 flex w-full flex-col gap-6">
          {props.children}
        </div>

        <div>
          <ReButton
            color="primary"
            className="w-full"
            onClick={props.onSave}
            startContent={
              !props.isSaving && <span className={cn(IconNames.Tabler.DOWNLOAD, 'text-xl')} />
            }
          >
            保存
          </ReButton>
        </div>
      </AdminSurfaceCard>
    </div>
  )
}
