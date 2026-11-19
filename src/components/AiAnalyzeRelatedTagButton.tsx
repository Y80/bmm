import { actAnalyzeRelatedTags } from '@/actions'
import AiAnalyzeButton from '@/components/AiAnalyzeButton'
import { AnalyzeRelatedTagsResult } from '@/lib/ai/types'
import { runAction } from '@/utils/client'

interface Props {
  tagName?: string
  onOk: (data: AnalyzeRelatedTagsResult) => void
}

export default function AiAnalyzeRelatedTagButton(props: Props) {
  async function onAnalyze() {
    if (!props.tagName) return
    const res = await runAction(actAnalyzeRelatedTags(props.tagName))
    if (!res.ok) return
    props.onOk?.(res.data)
  }

  return <AiAnalyzeButton onAnalyze={onAnalyze} isDisabled={!props.tagName} />
}
