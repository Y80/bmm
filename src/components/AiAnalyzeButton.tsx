import ReButton from '@/components/re-export/ReButton'
import { IconNames } from '@cfg'
import { cn } from '@heroui/react'

interface Props {
  onAnalyze: () => Promise<void>
  isDisabled?: boolean
  isAnalyzing?: boolean
  className?: string
}

export default function AiAnalyzeButton({ onAnalyze, isDisabled, isAnalyzing, className }: Props) {
  return (
    <ReButton
      size="sm"
      variant="light"
      isDisabled={isDisabled}
      isLoading={isAnalyzing}
      onPress={onAnalyze}
      startContent={
        <span className={cn('text-secondary text-base', IconNames.Mdi.STARS)} aria-hidden="true" />
      }
      className={cn(
        'text-foreground data-[hover=true]:bg-default-100 xs:h-8 xs:min-h-8 xs:min-w-20 min-h-11 min-w-24 shrink-0 gap-1.5 rounded-lg bg-transparent px-2',
        className
      )}
    >
      AI 解析
    </ReButton>
  )
}
