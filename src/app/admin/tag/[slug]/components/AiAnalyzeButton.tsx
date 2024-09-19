import ReButton from '@/components/re-export/ReButton'
import http from '@/lib/http'
import { ApiRoutes, IconNames } from '@cfg'
import clsx from 'clsx'

interface Props {
  tagName?: string
  onOk: (data: { relatedTags: string[]; color: string }) => void
}

export default function AiAnalyzeButton(props: Props) {
  async function onAnalyze() {
    if (!props.tagName) return
    const res = await http.post(ApiRoutes.Ai.ANALYZE_RELATED_TAGS, { tag: props.tagName })
    if (res.error) return
    props.onOk?.(res.data)
  }

  return (
    <ReButton
      isIconOnly
      size="sm"
      className={clsx('bg-transparent text-xl text-foreground-600', !props.tagName && 'scale-0')}
      tooltip="AI 智能解析"
      onClick={onAnalyze}
    >
      <span className={clsx('bg-gradient-to-r from-pink-500 to-violet-500', IconNames.STARS)} />
    </ReButton>
  )
}
