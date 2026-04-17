'use client'

import {
  ClientIcon,
  ColorPicker,
  EmptyListPlaceholder,
  ListPageLayout,
  SortTagModal,
} from '@/components'
import { ReButton } from '@/components/re-export'
import { usePageUtil } from '@/hooks'
import { IconNames, PageRoutes } from '@cfg'
import {
  ButtonGroup,
  cn,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react'
import { useSetState } from 'ahooks'
import { useRouter } from 'next/navigation'

// 定义组件的属性
export type TagListPageProps = {
  tags: SelectTag[]
  refreshTags: () => Promise<void>
  removeTag: (tag: SelectTag) => Promise<void>
  changeTag: (changedTag: SelectTag) => Promise<void>
}

export default function TagListPage(props: TagListPageProps) {
  const router = useRouter()
  const isAdminSpace = usePageUtil().isAdminSpace
  const [colorPicker, setColorPicker] = useSetState({
    isOpen: false,
    defaultValue: '' as string | null,
    targetTagId: 0,
  })

  function getRelatedTagsName(tagsId?: TagId[]) {
    if (!tagsId?.length) return ''
    return tagsId
      .map((id) => props.tags.find((tag) => tag.id === id))
      .map((tag) => tag?.name)
      .join('、')
  }

  function handleChangeIsMain(v: boolean, tag: SelectTag) {
    if (tag.isMain === v) return
    tag.isMain = v
    props.changeTag(tag)
  }

  function handleChangeColor(v: string) {
    const tag = props.tags.find((e) => e.id === colorPicker.targetTagId)!
    if (tag.color === v) return
    tag.color = v
    props.changeTag(tag)
  }

  function changeColor(tag: SelectTag) {
    setColorPicker({
      isOpen: true,
      defaultValue: tag.color,
      targetTagId: tag.id,
    })
  }

  return (
    <ListPageLayout title="标签列表">
      <ButtonGroup variant="flat" size="sm" className="mb-3 flex justify-end">
        <SortTagModal refreshTags={props.refreshTags} tags={props.tags}>
          <ReButton
            isDisabled={props.tags.length < 2}
            startContent={<span className={cn(IconNames.Tabler.ARROWS_SORT, 'text-sm')} />}
          >
            排序
          </ReButton>
        </SortTagModal>
      </ButtonGroup>
      <div className="overflow-hidden">
        <Table aria-label="tags table" removeWrapper>
          <TableHeader>
            <TableColumn>图标</TableColumn>
            <TableColumn>名称</TableColumn>
            <TableColumn className="max-xs:hidden">主题色</TableColumn>
            <TableColumn className="max-xs:hidden">主标签</TableColumn>
            <TableColumn>关联标签</TableColumn>
            <TableColumn>操作</TableColumn>
          </TableHeader>
          <TableBody emptyContent={<EmptyListPlaceholder target="tag" />}>
            {props.tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="text-foreground-700 max-xs:text-xl text-3xl">
                  {tag.icon ? (
                    <ClientIcon
                      icon={tag.icon}
                      color={tag.color || undefined}
                      className="size-7 text-3xl"
                    />
                  ) : null}
                </TableCell>
                <TableCell className="max-xs:text-sm">{tag.name}</TableCell>
                <TableCell className="max-xs:hidden w-24 pr-8 md:w-40">
                  {tag.color ? (
                    <div
                      className="h-8 w-full cursor-pointer rounded-lg border-2 transition duration-500"
                      style={{ backgroundColor: tag.color }}
                      onClick={() => changeColor(tag)}
                    />
                  ) : (
                    <ReButton
                      tooltip="设置标签主题色"
                      variant="ghost"
                      className="w-full"
                      size="sm"
                      onClick={() => changeColor(tag)}
                    >
                      设 置
                    </ReButton>
                  )}
                </TableCell>
                <TableCell className="max-xs:hidden">
                  <Switch
                    aria-label="is main switch"
                    size="sm"
                    isSelected={tag.isMain || false}
                    onValueChange={(v) => handleChangeIsMain(v, tag)}
                  />
                </TableCell>
                <TableCell>
                  <div className="max-xs:max-w-24 truncate text-sm">
                    {getRelatedTagsName(tag.relatedTagIds)}
                  </div>
                </TableCell>
                <TableCell>
                  <ReButton
                    variant="light"
                    color="danger"
                    className="text-2xl"
                    isIconOnly
                    startContent={<span className={IconNames.Tabler.TRASH} />}
                    popoverContent={
                      <div className="flex max-w-[280px] flex-col gap-4 p-4">
                        <p>确定删除标签「{tag.name}」？</p>
                        <ReButton
                          color="danger"
                          size="sm"
                          variant="shadow"
                          onClick={() => props.removeTag(tag)}
                        >
                          确定
                        </ReButton>
                      </div>
                    }
                  />
                  <ReButton
                    variant="light"
                    className="text-2xl"
                    isIconOnly
                    color="warning"
                    startContent={<span className={IconNames.Tabler.EDIT} />}
                    onClick={() =>
                      router.push(
                        (isAdminSpace ? PageRoutes.Admin : PageRoutes.User).tagSlug(tag.id)
                      )
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ColorPicker
        {...colorPicker}
        onClose={() => setColorPicker({ isOpen: false })}
        onSelect={handleChangeColor}
      />
    </ListPageLayout>
  )
}
