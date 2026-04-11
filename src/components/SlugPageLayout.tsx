'use client'

import { IconNames } from '@cfg'
import { Button, Divider, cn } from '@heroui/react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { PropsWithChildren } from 'react'
import { ReButton } from './re-export'

interface Props {
  isSaving?: boolean
  onSave?: () => void
  onCancel?: () => void
}

export default function SlugPageLayout(props: PropsWithChildren<Props>) {
  const { slug } = useParams<{ slug: string }>()
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex-items-center mx-auto w-md flex-col py-16">
      <h1 className="text-3xl">
        <span className="bg-foreground-200 text-foreground mr-4 rounded-xl px-4 py-1">
          {slug === 'new' ? '新建' : '编辑'}
        </span>
        <span>{pathname.includes('/tag') ? '标签' : '书签'}</span>
      </h1>
      <Divider className="my-16" />
      {/* 要求：表单项目垂直排列、间距固定为 6 */}
      <div role="form-box" className="mb-8 flex w-full flex-col gap-6">
        {props.children}
      </div>

      <Button
        className="mt-20 w-full"
        isLoading={props.isSaving}
        onPress={router.back}
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
