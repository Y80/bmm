'use client'

import {
  AiAnalyzeRelatedTagButton,
  ColorPicker,
  IconPicker,
  SlugPageLayout,
  TagSelect,
} from '@/components'
import { SelectedIcon } from '@/components/IconPicker'
import { ReInput, ReTooltip } from '@/components/re-export'
import { SelectPublicTag } from '@/controllers/PublicTag.controller'
import useSlug from '@/hooks/useSlug'
import { Accordion, AccordionItem, addToast, Switch } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useSetState } from 'ahooks'
import { useEffect } from 'react'

type Tag = Pick<SelectPublicTag, 'name' | 'color' | 'icon' | 'isMain' | 'relatedTagIds'>

export type TagSlugPageProps = {
  tags: SelectPublicTag[]
  save: (tag: Tag) => Promise<any>
}

export default function TagSlugPage(props: TagSlugPageProps) {
  const [tag, setTag] = useSetState<Tag>({
    name: '',
    color: '',
    icon: '',
    isMain: true,
    relatedTagIds: [],
  })
  const [state, setState] = useSetState({
    isOpenIconPicker: false,
    isOpenColorPicker: false,
    selectedIcon: null as null | SelectedIcon,
    selectedTags: [] as number[],
    isSaving: false,
    analyzing: false,
  })

  const slug = useSlug()

  useEffect(() => {
    if (slug.number === null) return
    const foundTag = props.tags.find((t) => t.id === slug.number)
    if (foundTag) {
      setTag({ ...foundTag })
    }
  }, [setTag, slug.number, props.tags])

  function openIconPicker(e: any) {
    e.target.blur()
    setState({ isOpenIconPicker: true })
  }

  function openColorPicker(e: any) {
    e.target.blur()
    setState({ isOpenColorPicker: true })
  }

  async function onSave() {
    if (!tag.name) {
      addToast({ title: '请输入「名称」', color: 'warning' })
      return
    }
    props.save(tag)
  }

  function onSelectIcon(icon: SelectedIcon) {
    setState({ selectedIcon: icon })
    setTag({ icon: icon.prefix + ':' + icon.name })
  }

  function renderIcon() {
    if (state.selectedIcon?.body) {
      return (
        <span className="flex-shrink-0 text-[1.875rem]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            dangerouslySetInnerHTML={{ __html: state.selectedIcon.body }}
          />
        </span>
      )
    }
    if (tag.icon)
      return (
        <span className="flex-shrink-0 text-[1.875rem]">
          <Icon icon={tag.icon} />
        </span>
      )
  }

  function onReceiveRelatedTags(params: { relatedTags: string[]; color: string }) {
    const { relatedTags, color } = params
    setTag({
      color: color,
      relatedTagIds: relatedTags.reduce((acc: number[], tagName) => {
        const foundTag = props.tags.find(({ name }) => name === tagName)
        if (!foundTag?.id || foundTag.id === slug.number || acc.includes(foundTag.id)) return acc
        acc.push(foundTag.id)
        return acc
      }, []),
    })
  }

  return (
    <SlugPageLayout onSave={onSave}>
      <ReInput
        label="名称"
        isRequired
        maxLength={20}
        value={tag.name}
        onValueChange={(name) => setTag({ name })}
        endContent={
          !!props.tags.length && (
            <AiAnalyzeRelatedTagButton tagName={tag.name} onOk={onReceiveRelatedTags} />
          )
        }
      />
      <ReInput
        label="图标"
        onFocus={openIconPicker}
        value={tag.icon || ''}
        endContent={renderIcon()}
      />
      <ReInput
        label="主题色"
        value={tag.color || ''}
        onFocus={openColorPicker}
        endContent={
          tag.color && (
            <div
              style={{ backgroundColor: tag.color }}
              className="size-7 flex-shrink-0 rounded-full border border-white"
            />
          )
        }
      />
      <Accordion className="mt-2 px-0" defaultSelectedKeys={['1']}>
        <AccordionItem
          key="1"
          textValue="more settings"
          title={<span className="text-foreground-600">更多设置</span>}
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <label className="gap-2 text-sm flex-items-center">
                <span>主标签</span>
                <ReTooltip content="首页可设置「仅展示主标签」">
                  <div className="cursor-pointer rounded-full border border-foreground p-px flex-center">
                    <span className="icon-[tabler--question-mark] size-3" />
                  </div>
                </ReTooltip>
              </label>
              <Switch isSelected={tag.isMain!} onValueChange={(isMain) => setTag({ isMain })} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm">关联标签</label>
              <TagSelect
                tags={props.tags}
                value={tag.relatedTagIds}
                excludeTagIds={slug.number ? [slug.number] : undefined}
                onChange={(value) => setTag({ relatedTagIds: value })}
              />
            </div>
          </div>
        </AccordionItem>
      </Accordion>
      <IconPicker
        isOpen={state.isOpenIconPicker}
        onClose={() => setState({ isOpenIconPicker: false })}
        onSelect={onSelectIcon}
      />
      <ColorPicker
        isOpen={state.isOpenColorPicker}
        defaultValue={tag.color}
        onClose={() => setState({ isOpenColorPicker: false })}
        onSelect={(color) => setTag({ color })}
      />
    </SlugPageLayout>
  )
}
