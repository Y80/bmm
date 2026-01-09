import { actAnalyzeRelatedTags } from '@/actions'
import { ReButton } from '@/components/re-export'
import { AnalyzeRelatedTagsResult } from '@/lib/ai/types'
import { runAction } from '@/utils/client'
import { IconNames } from '@cfg'
import { cn } from '@heroui/react'

interface Props {
  tagName?: string
  onOk: (data: AnalyzeRelatedTagsResult) => void
}

export default function AiAnalyzeButton(props: Props) {
  async function onAnalyze() {
    if (!props.tagName) return
    const res = await runAction(actAnalyzeRelatedTags(props.tagName))
    if (!res.ok) return
    props.onOk?.(res.data)
  }

  return (
    <ReButton
      isIconOnly
      size="sm"
      className={cn('text-foreground-600 bg-transparent text-xl', !props.tagName && 'scale-0')}
      tooltip="AI 智能解析"
      onClick={onAnalyze}
    >
      <span className={cn('bg-linear-to-r from-pink-500 to-violet-500', IconNames.STARS)} />
    </ReButton>
  )
}
