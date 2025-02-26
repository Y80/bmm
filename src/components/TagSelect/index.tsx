import { useGlobalContext } from '@/app/ctx'
import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import { testTagNameOrPinyin } from '@/utils'
import { Chip, cn, ScrollShadow } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useSetState, useThrottleFn } from 'ahooks'
import RcSelect from 'rc-select'
import 'rc-select/assets/index.css'
import { ReactNode, useEffect, useMemo } from 'react'
import style from './style.module.css'

type ValueType = SelectPublicTag['id'][]

interface Props {
  value?: ValueType
  excludeTagIds?: ValueType
  endContent?: ReactNode
  onChange?: (value: ValueType) => void
}

/**
 * 标签下拉选择器
 * - NextUI 的 Select 不支持输入筛选，因此这里基于 RcSelect 手动实现
 * - 这个组件会把已选中的标签在下拉列表中过滤掉
 */
export default function TagSelect(props: Props) {
  const [state, setState] = useSetState({
    open: false,
    value: [] as ValueType,
  })

  const { tags } = useGlobalContext()

  const mergedValue = props.value || state.value

  const filteredOptions = useMemo(() => {
    return tags
      .filter((tag) => !mergedValue.includes(tag.id))
      .filter((tag) => !(props.excludeTagIds || []).includes(tag.id))
      .map((tag) => ({
        // ...item,
        label: tag.name,
        value: tag.id,
        icon: tag.icon,
        pinyin: tag.pinyin,
      }))
  }, [tags, mergedValue, props.excludeTagIds])

  const setOpen = useThrottleFn((open) => setState({ open }), {
    wait: 200,
    leading: true,
    trailing: false,
  })

  function onValueChange(value: ValueType) {
    setState({ value })
    props.onChange?.(value)
  }

  function onRemoveTag(target: ValueType[number]) {
    const value = mergedValue.filter((v) => v !== target)
    onValueChange(value)
  }

  useEffect(() => {
    const div = document.querySelector<HTMLDivElement>(
      'div[role="tag-select"] .rc-select-selection-overflow'
    )
    if (!props.endContent || !div) return
    div.style.width = 'calc(100% - 2rem)'
  }, [props.endContent])

  return (
    <div role="tag-select">
      <div
        className={cn(
          'relative cursor-not-allowed overflow-hidden rounded-medium bg-default-50 p-4 py-3 text-center text-sm text-warning-400/80',
          tags.length && 'hidden'
        )}
      >
        暂不可用，请先创建一些标签数据～
      </div>
      <div
        className={cn(
          'relative overflow-hidden rounded-medium bg-default-100',
          style.rcSelectWrapper,
          !tags.length && 'hidden'
        )}
      >
        <RcSelect<ValueType, (typeof filteredOptions)[number]>
          mode="multiple"
          showSearch
          maxCount={6}
          animation="slide-up2"
          open={state.open}
          options={filteredOptions}
          value={mergedValue}
          virtual={false}
          dropdownClassName={style.rcSelectDropdown}
          onChange={onValueChange}
          onDropdownVisibleChange={setOpen.run}
          filterOption={(input, opt) => {
            return testTagNameOrPinyin(input, { name: opt?.label, pinyin: opt?.pinyin })
          }}
          dropdownRender={(menu) => <ScrollShadow className="h-[300px]">{menu}</ScrollShadow>}
          notFoundContent={<div className="mt-20">暂无内容</div>}
          optionRender={(opt) => (
            <div className="gap-2 text-foreground-800 flex-items-center">
              {opt.data.icon && <Icon icon={opt.data.icon} />}
              <span>{opt.label}</span>
            </div>
          )}
          tagRender={(opt) => (
            <Chip size="sm" color="warning" onClose={() => onRemoveTag(opt.value)}>
              {tags.find((t) => t.id === opt.value)?.name}
            </Chip>
          )}
        />
        <span className="absolute right-2 top-1/2 size-8 -translate-y-1/2 p-1 flex-center">
          {props.endContent}
        </span>
      </div>
    </div>
  )
}
