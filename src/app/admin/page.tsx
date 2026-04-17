'use client'

import { Card, CardBody, CardHeader, Progress, cn } from '@heroui/react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

import { ClientIcon, NumberTicker, ReButton } from '@/components'
import { IconNames, PageRoutes } from '@cfg'

import { useAdminContext } from './ctx'

export default function Page() {
  const session = useSession()
  const { tags, totalBookmarks, totalUsers } = useAdminContext()

  const adminName = session.data?.user?.name || '管理员'
  const now = dayjs().locale('zh-cn')
  const mainTagCount = tags.filter((tag) => tag.isMain).length
  const secondaryTagCount = Math.max(tags.length - mainTagCount, 0)
  const visualTagCount = tags.filter((tag) => tag.icon || tag.color).length
  const tagsWithVisuals = tags.filter((tag) => tag.icon || tag.color).slice(0, 6)
  const missingIconTags = tags
    .filter((tag) => !tag.icon)
    .sort((a, b) => Number(b.isMain) - Number(a.isMain) || b.relatedTagIds.length - a.relatedTagIds.length)
  const missingIconCount = missingIconTags.length
  const missingMainIconCount = missingIconTags.filter((tag) => tag.isMain).length
  const iconCoveragePercent = tags.length
    ? Math.round(((tags.length - missingIconCount) / tags.length) * 100)
    : 100
  const missingIconPreview = missingIconTags.slice(0, 5)
  const mainTagPercent = tags.length ? Math.round((mainTagCount / tags.length) * 100) : 0
  const hints = [
    totalBookmarks
      ? `当前公开区已有 ${totalBookmarks} 个书签，建议优先补全描述、图标和置顶配置。`
      : '当前还没有公开书签，建议先从“新建书签”或“批量导入”开始补充内容。',
    tags.length
      ? `标签总数为 ${tags.length}，其中主标签 ${mainTagCount} 个，可继续整理附属标签关系。`
      : '当前没有标签，建议先创建一组主标签，再录入书签内容。',
    totalUsers > 1
      ? `系统已有 ${totalUsers} 位用户，管理员可以定期在“用户列表”检查注册与权限状态。`
      : '当前用户数量较少，若要开放协作，可先检查注册流程与管理员权限配置。',
  ]
  const stats = [
    {
      label: '公开书签',
      value: totalBookmarks,
      description: '面向前台展示的可访问内容',
      icon: IconNames.Tabler.BOOKMARK,
      accent:
        'from-sky-400/14 via-cyan-400/6 to-transparent dark:from-sky-400/25 dark:via-cyan-400/10',
      iconWrap:
        'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/15 dark:bg-white/10 dark:text-white',
    },
    {
      label: '标签总数',
      value: tags.length,
      description: '用于导航、筛选与内容组织',
      icon: IconNames.Tabler.TAG,
      accent:
        'from-emerald-400/14 via-teal-400/6 to-transparent dark:from-emerald-400/20 dark:via-teal-400/10',
      iconWrap:
        'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/15 dark:bg-white/10 dark:text-white',
    },
    {
      label: '主标签',
      value: mainTagCount,
      description: '建议保持结构清晰、数量适中',
      icon: IconNames.Huge.LIST,
      accent:
        'from-amber-300/18 via-orange-400/8 to-transparent dark:from-amber-300/20 dark:via-orange-400/10',
      iconWrap:
        'bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/15 dark:bg-white/10 dark:text-white',
    },
    {
      label: '注册用户',
      value: totalUsers,
      description: '包含当前可登录后台的账户',
      icon: IconNames.Tabler.USER,
      accent:
        'from-rose-400/14 via-fuchsia-400/6 to-transparent dark:from-fuchsia-400/20 dark:via-rose-400/10',
      iconWrap:
        'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/15 dark:bg-white/10 dark:text-white',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card
        shadow="none"
        className="border-divider/60 bg-white/90 dark:bg-content1/80 overflow-hidden rounded-[28px] border shadow-[0_18px_50px_-32px_rgba(15,23,42,0.18)] dark:shadow-none"
      >
        <CardBody className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.2),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_30%)]" />
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:26px_26px] opacity-45 dark:[background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-20" />

          <div className="relative px-5 py-6 sm:px-7 sm:py-7">
            <div className="max-w-3xl space-y-5">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  欢迎回来，{adminName}
                </h1>
                <p className="text-default-600 mt-2 max-w-2xl text-sm leading-6 sm:text-base">
                  {now.format('YYYY 年 M 月 D 日 dddd')}，关注内容规模、标签结构与账户状态。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <ReButton
                  href={PageRoutes.Admin.bookmarkSlug('new')}
                  className="bg-foreground text-background px-5 dark:bg-white dark:text-black"
                  startContent={<span className={cn(IconNames.Tabler.PLUS, 'text-base')} />}
                >
                  新建书签
                </ReButton>
                <ReButton
                  href={PageRoutes.Admin.UPLOAD}
                  variant="bordered"
                  className="border-divider/70 bg-white/70 hover:bg-white/90 dark:bg-background/40 px-5"
                  startContent={<span className={cn(IconNames.Tabler.UPLOAD, 'text-base')} />}
                >
                  批量导入
                </ReButton>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card
            key={stat.label}
            shadow="none"
            className="border-divider/60 bg-white/88 dark:bg-content1 overflow-hidden border shadow-[0_16px_40px_-30px_rgba(15,23,42,0.18)] dark:shadow-none"
          >
            <CardBody className="relative gap-5 p-5">
              <div className={cn('absolute inset-0 bg-linear-to-br opacity-90 dark:opacity-100', stat.accent)} />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="text-default-500 text-sm">{stat.label}</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight">
                    <NumberTicker value={stat.value} delay={idx * 0.08} />
                  </div>
                </div>
                <div
                  className={cn(
                    'flex size-11 items-center justify-center rounded-2xl',
                    stat.iconWrap
                  )}
                >
                  <span className={cn(stat.icon, 'text-xl')} />
                </div>
              </div>
              <div className="text-default-600 relative text-sm leading-6">{stat.description}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6">
        <Card
          shadow="none"
          className="border-divider/60 bg-white/88 dark:bg-content1 border shadow-[0_16px_44px_-34px_rgba(15,23,42,0.16)] dark:shadow-none"
        >
          <CardHeader className="flex-col items-start gap-2 px-6 pt-6 pb-0 sm:px-7">
            <h2 className="text-xl font-semibold">标签结构</h2>
            <p className="text-default-500 text-sm">用主标签、辅助标签和视觉配置快速判断当前整理进度。</p>
          </CardHeader>
          <CardBody className="gap-6 px-6 pt-5 pb-6 sm:px-7 sm:pb-7">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="border-divider/60 bg-white/82 dark:bg-default-100/5 rounded-2xl border px-4 py-3.5">
                <div className="text-default-500 text-xs">主标签</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{mainTagCount}</div>
                <div className="text-default-500 mt-1 text-xs">当前占比 {mainTagPercent}%</div>
              </div>
              <div className="border-divider/60 bg-white/82 dark:bg-default-100/5 rounded-2xl border px-4 py-3.5">
                <div className="text-default-500 text-xs">辅助标签</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{secondaryTagCount}</div>
                <div className="text-default-500 mt-1 text-xs">负责补充筛选和语义关联</div>
              </div>
              <div className="border-divider/60 bg-white/82 dark:bg-default-100/5 rounded-2xl border px-4 py-3.5">
                <div className="text-default-500 text-xs">视觉配置</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{visualTagCount}</div>
                <div className="text-default-500 mt-1 text-xs">已配置图标或颜色</div>
              </div>
            </div>

            <div className="border-divider/60 bg-default-50/55 dark:bg-default-100/5 rounded-2xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium">图标覆盖率</div>
                    <span className="text-default-400 text-xs">
                      已覆盖 {tags.length - missingIconCount}/{tags.length || 0}
                    </span>
                  </div>
                  <p className="text-default-500 mt-1 text-xs leading-5">
                    还缺少 {missingIconCount} 个标签图标，其中主标签有 {missingMainIconCount} 个。
                  </p>
                </div>
              </div>

              <div className="border-divider/60 bg-amber-400/8 mt-4 flex items-start gap-2 rounded-xl border px-3 py-2.5">
                <span className={cn(IconNames.Tabler.SPARKLES, 'text-amber-500 mt-0.5 text-sm')} />
                <p className="text-default-600 text-xs leading-5">
                  补充标签图标后，网站用户在浏览导航和筛选时会更容易识别分类入口，整体体验也会更顺手。
                </p>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-default-500">图标覆盖率</span>
                  <span className="font-medium">{iconCoveragePercent}%</span>
                </div>
                <Progress
                  aria-label="标签图标覆盖率"
                  value={iconCoveragePercent}
                  classNames={{
                    indicator: cn(
                      'bg-linear-to-r',
                      missingIconCount
                        ? 'from-amber-400 via-orange-400 to-rose-400'
                        : 'from-emerald-400 via-teal-400 to-cyan-400'
                    ),
                    track: 'bg-default-200/70 dark:bg-default-100/10 h-1.5 min-h-1.5',
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {missingIconPreview.length ? (
                  missingIconPreview.map((tag) => (
                    <Link
                      key={tag.id}
                      href={PageRoutes.Admin.tagSlug(tag.id)}
                      className="border-divider/70 bg-default-50/85 text-foreground hover:border-amber-500/20 hover:bg-amber-400/10 inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-[background-color,border-color,color] outline-none focus-visible:ring-2 focus-visible:ring-amber-400/30 dark:bg-default-100/5 dark:hover:bg-amber-400/10"
                    >
                      <span className={cn(IconNames.Tabler.PHOTO_OFF, 'text-default-400 text-sm')} />
                      <span className="max-w-24 truncate">{tag.name}</span>
                      {tag.isMain && (
                        <span className="bg-amber-400/15 text-amber-700 rounded-full px-1.5 py-0.5 text-[10px] leading-none dark:text-amber-300">
                          主
                        </span>
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="text-default-500 text-sm">所有标签都已经配置图标。</div>
                )}
              </div>

              <div className="mt-4">
                <Link
                  href={PageRoutes.Admin.tagSlug('list')}
                  className={cn(
                    'focus-visible:ring-foreground/30 inline-flex rounded-full px-2.5 py-1 text-sm font-semibold transition-colors outline-none focus-visible:ring-2',
                    missingIconCount
                      ? 'bg-amber-400/15 text-amber-700 hover:bg-amber-400/25 dark:text-amber-300'
                      : 'bg-emerald-400/15 text-emerald-700 hover:bg-emerald-400/25 dark:text-emerald-300'
                  )}
                >
                  {missingIconCount ? `${missingIconCount} 个待补充` : '已完善'}
                </Link>
              </div>
            </div>

            <div className="border-divider/60 bg-white/80 dark:bg-default-100/5 rounded-3xl border p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">带视觉配置的标签</div>
                  <div className="text-default-500 mt-1 text-xs">优先展示可直接用于导航辨识的标签。</div>
                </div>
                <div className="text-default-400 text-xs">共 {visualTagCount} 个</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagsWithVisuals.length ? (
                  tagsWithVisuals.map((tag) => (
                    <Link
                      key={tag.id}
                      href={PageRoutes.Admin.tagSlug(tag.id)}
                      className="border-divider/70 bg-default-50/80 text-foreground hover:border-foreground/10 hover:bg-default-100 hover:shadow-sm hover:shadow-black/5 focus-visible:ring-foreground/30 active:border-foreground/15 active:bg-foreground active:text-background dark:bg-default-100/5 dark:hover:bg-default-100/10 dark:hover:shadow-black/10 dark:active:bg-white/14 inline-flex h-9 max-w-full items-center gap-2 rounded-full border px-2.5 text-xs font-medium transition-[background-color,border-color,color,transform,box-shadow] outline-none hover:-translate-y-px active:scale-[0.98] active:translate-y-0 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] focus-visible:ring-2"
                    >
                      <span className="bg-background/80 dark:bg-default-100/10 flex size-6 shrink-0 items-center justify-center rounded-full">
                        <ClientIcon
                          icon={tag.icon || IconNames.Tabler.TAG}
                          className="size-4 text-base"
                        />
                      </span>
                      {tag.color && (
                        <span
                          className="size-2 shrink-0 rounded-full ring-1 ring-black/8 dark:ring-white/12"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      <span className="max-w-24 truncate">{tag.name}</span>
                    </Link>
                  ))
                ) : (
                  <div className="text-default-500 text-sm">暂时没有配置图标或颜色的标签。</div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card
          shadow="none"
          className="border-divider/60 bg-white/88 dark:bg-content1 border shadow-[0_16px_44px_-34px_rgba(15,23,42,0.16)] dark:shadow-none"
        >
          <CardHeader className="flex-col items-start gap-2 px-6 pt-6 pb-0 sm:px-7">
            <h2 className="text-xl font-semibold">管理提示</h2>
            <p className="text-default-500 text-sm">
              根据当前数据规模，给出下一步更值得处理的方向。
            </p>
          </CardHeader>
          <CardBody className="gap-4 px-6 pt-5 pb-6 sm:px-7 sm:pb-7">
            {hints.map((hint, idx) => (
              <div
                key={hint}
                className="border-divider/60 bg-white/80 dark:bg-default-100/5 flex gap-4 rounded-3xl border px-5 py-4.5"
              >
                <div className="bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/15 dark:bg-white dark:text-black flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {idx + 1}
                </div>
                <p className="text-default-600 text-sm leading-6">{hint}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
