import { Button, Divider } from "@heroui/react"
import { useParams, usePathname, useRouter } from 'next/navigation'
import { PropsWithChildren } from 'react'
import ReButton from './re-export/ReButton'

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
    <div className="mx-auto w-[28rem] flex-col py-16 flex-items-center">
      <h1 className="text-3xl">
        <span className="mr-4 rounded-xl bg-foreground-200 px-4 py-1 text-foreground">
          {slug === 'new' ? '新建' : '编辑'}
        </span>
        <span>{pathname.includes('tag') ? '标签' : '书签'}</span>
      </h1>
      <Divider className="my-16" />
      {/* 要求：表单项目垂直排列、间距固定为 6 */}
      <div role="form-box" className="mb-8 flex w-full flex-col gap-6">
        {props.children}
      </div>

      <Button
        className="mt-20 w-full"
        isLoading={props.isSaving}
        onClick={router.back}
        startContent={<span className="icon-[tabler--arrow-back] text-xl" />}
      >
        返 回
      </Button>
      <ReButton
        color="primary"
        className="mt-4 w-full shadow-lg"
        onClick={props.onSave}
        startContent={!props.isSaving && <span className="icon-[tabler--download] text-xl" />}
      >
        保 存
      </ReButton>
    </div>
  )
}
