'use client'

import { actUpdateUserProfile } from '@/actions'
import AdminPageTitle from '@/components/AdminPageTitle'
import { ReButton, ReInput } from '@/components'
import { zodSchemas } from '@/lib/zod'
import { robustUrl } from '@/utils'
import { runAction } from '@/utils/client'
import { FieldConstraints, IconNames } from '@cfg'
import { Avatar, Card, CardBody, Form, FormProps, cn } from '@heroui/react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { FormEvent, useState, useTransition } from 'react'

type Props = {
  user: {
    name: string
    image: string
    email: string
  }
}

export default function ClientPage(props: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const session = useSession()
  const [isRefreshing, startTransition] = useTransition()
  const [form, setForm] = useState({
    name: props.user.name,
    image: props.user.image,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<FormProps['validationErrors']>()

  const previewSrc = robustUrl(form.image) || undefined

  function validateForm(values: unknown) {
    setValidationErrors(undefined)
    const result = zodSchemas.userProfileUpdate.safeParse(values)
    if (result.success) return result.data
    setValidationErrors(result.error.flatten().fieldErrors)
    return false
  }

  async function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault()

    const formData = Object.fromEntries(new FormData(evt.currentTarget))
    const values = validateForm(formData)
    if (!values) return

    setIsSaving(true)
    const result = await runAction(actUpdateUserProfile(values), {
      okMsg: '个人资料已更新',
      onOk: async (data) => {
        const nextForm = {
          name: data.name || '',
          image: data.image || '',
        }
        setForm(nextForm)
        await session.update(nextForm)
        startTransition(() => router.refresh())
      },
    })
    setIsSaving(false)

    if (!result.ok) return
  }

  return (
    <div className="relative mx-auto flex h-full w-full max-w-5xl items-start px-6">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <AdminPageTitle title="个人资料" pathname={pathname} icon={IconNames.Tabler.USER} />

        <Card
          shadow="none"
          className="border-divider/60 bg-white/58 backdrop-blur-xl dark:bg-content1/62 overflow-hidden rounded-[28px] border shadow-[0_18px_50px_-32px_rgba(15,23,42,0.18)] dark:shadow-none"
        >
          <CardBody className="relative overflow-hidden p-0">
            <div className="relative flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-7">
              <section className="flex justify-center">
                <div className="bg-white/38 backdrop-blur-md dark:bg-default-100/5 w-full max-w-[188px] rounded-[24px] px-4 py-5 text-center">
                  <div className="border-divider/60 bg-background/70 mx-auto flex h-24 w-24 items-center justify-center rounded-full border shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
                    <Avatar
                      className="h-20 w-20 text-2xl shadow-md"
                      src={previewSrc}
                      name={form.name || props.user.email}
                      showFallback
                    />
                  </div>
                  <h2 className="mt-3 text-base font-semibold">{form.name || '未设置昵称'}</h2>
                  <p className="text-foreground-400 mt-1 text-xs break-all">{props.user.email}</p>
                </div>
              </section>

              <section className="bg-white/38 backdrop-blur-md dark:bg-default-100/5 rounded-[24px] px-6 py-7 md:px-7 md:py-7">
                <Form validationErrors={validationErrors} onSubmit={handleSubmit}>
                  <ReInput
                    label="昵称"
                    name="name"
                    isRequired
                    maxLength={FieldConstraints.MaxLen.USER_NICKNAME}
                    description={`最多 ${FieldConstraints.MaxLen.USER_NICKNAME} 个字符`}
                    value={form.name}
                    onValueChange={(name) => setForm({ ...form, name })}
                  />
                  <ReInput
                    label="头像 URL"
                    name="image"
                    placeholder="https://example.com/avatar.png"
                    description="支持留空"
                    value={form.image}
                    onValueChange={(image) => setForm({ ...form, image })}
                  />

                  <div className="mt-5 flex w-full justify-end">
                    <ReButton
                      type="submit"
                      color="primary"
                      className={cn('min-w-28 shadow-sm')}
                      isLoading={isSaving || isRefreshing}
                    >
                      保存资料
                    </ReButton>
                  </div>
                </Form>
              </section>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
