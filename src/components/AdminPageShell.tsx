'use client'

import { Card, CardBody, CardHeader, Chip, cn } from '@heroui/react'
import { ReactNode } from 'react'

export interface AdminPageStat {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
  icon?: string
  accent?: string
}

interface AdminPageShellProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  stats?: AdminPageStat[]
  actions?: ReactNode
  aside?: ReactNode
  children?: ReactNode
  className?: string
}

interface AdminSurfaceCardProps {
  title?: ReactNode
  description?: ReactNode
  extra?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

const DEFAULT_ACCENT =
  'from-sky-400/16 via-cyan-400/8 to-transparent dark:from-sky-400/18 dark:via-cyan-400/8'

export function AdminPageShell(props: AdminPageShellProps) {
  const hasAside = !!props.aside

  return (
    <div className={cn('flex flex-col gap-6', props.className)}>
      <Card
        shadow="none"
        className="border-divider/70 overflow-hidden rounded-[28px] border bg-white/58 backdrop-blur-xl dark:bg-content1/62"
      >
        <CardBody className="relative overflow-hidden p-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.14),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_30%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] [background-size:26px_26px] opacity-80 dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] dark:opacity-20" />

          <div
            className={cn(
              'relative grid gap-6 px-5 py-6 sm:px-7 sm:py-7',
              hasAside && 'xl:grid-cols-[minmax(0,1.7fr)_320px]'
            )}
          >
            <div className="space-y-5">
              {props.eyebrow ? (
                <div className="flex flex-wrap items-center gap-3">
                  <Chip
                    size="sm"
                    variant="flat"
                    className="border border-white/10 bg-black/70 px-2 text-white dark:bg-white/10"
                  >
                    {props.eyebrow}
                  </Chip>
                </div>
              ) : null}

              <div className="max-w-3xl space-y-3">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {props.title}
                  </h1>
                  {props.description ? (
                    <p className="text-default-600 mt-2 max-w-2xl text-sm leading-6 sm:text-base">
                      {props.description}
                    </p>
                  ) : null}
                </div>

                {props.stats?.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {props.stats.map((stat, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'border-divider/60 bg-background/60 relative overflow-hidden rounded-2xl border px-4 py-3 backdrop-blur dark:border-white/10',
                          stat.accent && 'text-white'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute inset-0 bg-linear-to-br opacity-100',
                            stat.accent || DEFAULT_ACCENT
                          )}
                        />
                        <div className="relative flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-default-400 text-xs tracking-[0.24em] uppercase">
                              {stat.label}
                            </div>
                            <div className="text-foreground mt-2 text-lg font-semibold">
                              {stat.value}
                            </div>
                            {stat.description ? (
                              <div className="text-default-500 mt-1 text-xs leading-5">
                                {stat.description}
                              </div>
                            ) : null}
                          </div>
                          {stat.icon ? (
                            <div className="border-divider/60 bg-background/60 flex size-9 shrink-0 items-center justify-center rounded-2xl border dark:border-white/10">
                              <span className={cn(stat.icon, 'text-lg')} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {props.actions ? <div className="flex flex-wrap gap-3">{props.actions}</div> : null}
            </div>

            {props.aside ? <div className="grid gap-4">{props.aside}</div> : null}
          </div>
        </CardBody>
      </Card>

      {props.children}
    </div>
  )
}

export function AdminSurfaceCard(props: AdminSurfaceCardProps) {
  return (
    <Card
      shadow="none"
      className={cn(
        'border-divider/70 overflow-hidden rounded-[28px] border bg-white/58 shadow-sm shadow-black/[0.03] backdrop-blur-xl dark:bg-content1/62 dark:shadow-black/10',
        props.className
      )}
    >
      {props.title || props.description || props.extra ? (
        <CardHeader className="flex items-center justify-between gap-4 pb-0">
          <div>
            {props.title ? <h2 className="text-xl font-semibold">{props.title}</h2> : null}
            {props.description ? (
              <p className="text-default-500 mt-1 text-sm">{props.description}</p>
            ) : null}
          </div>
          {props.extra}
        </CardHeader>
      ) : null}
      <CardBody className={cn('p-5 sm:p-6', props.bodyClassName)}>{props.children}</CardBody>
    </Card>
  )
}
