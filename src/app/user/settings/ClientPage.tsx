'use client'

import { actUpdateUserProfile } from '@/actions'
import { ReButton, ReInput } from '@/components'
import { zodSchemas } from '@/lib/zod'
import { robustUrl } from '@/utils'
import { runAction } from '@/utils/client'
import { FieldConstraints, IconNames, PageRoutes } from '@cfg'
import { Avatar, Form, FormProps } from '@heroui/react'
import { useRouter } from 'next/navigation'
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
    <div className="relative mx-auto flex h-full w-full max-w-5xl items-center px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-6">
          <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold tracking-tight">
            <span className={IconNames.Tabler.USER} />
            <span>个人资料</span>
          </h1>
        </div>

        <div className="bg-background relative grid overflow-hidden rounded-[2rem] shadow-[0_18px_56px_rgba(15,23,42,0.08)] md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="from-secondary-100/55 via-background to-primary-100/70 absolute inset-0 bg-linear-to-br" />

          <section className="relative flex items-center justify-center px-5 py-6 md:px-6">
            <div className="w-full max-w-[188px] rounded-[1.5rem] bg-white/72 px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-md dark:bg-white/6 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_36px_rgba(0,0,0,0.34)]">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/70 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:bg-white/8 dark:shadow-[0_12px_28px_rgba(0,0,0,0.28)]">
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

          <section className="relative flex flex-col justify-center px-6 py-7 md:px-9 md:py-8">
            <div className="mb-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <span className={IconNames.Tabler.EDIT} />
                <span>编辑资料</span>
              </h2>
            </div>

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

              <div className="mt-5 flex w-full flex-wrap gap-2.5">
                <ReButton
                  type="submit"
                  color="primary"
                  className="min-w-28 shadow-sm"
                  isLoading={isSaving || isRefreshing}
                  startContent={
                    isSaving || isRefreshing ? null : (
                      <span className={IconNames.Tabler.CHECK} />
                    )
                  }
                >
                  保存资料
                </ReButton>
                <ReButton
                  href={PageRoutes.User.INDEX}
                  variant="light"
                  className="text-foreground-600"
                  startContent={<span className={IconNames.Tabler.ARROW_LEFT} />}
                >
                  返回个人空间
                </ReButton>
              </div>
            </Form>
          </section>
        </div>
      </div>
    </div>
  )
}
