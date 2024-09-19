'use client'

import { useGlobalContext } from '@/app/ctx'
import ColorPicker from '@/components/ColorPicker'
import ListPageLayout from '@/components/ListPageLayout'
import ReButton from '@/components/re-export/ReButton'
import { SelectPublicTag } from '@/db/sqlite/schemas'
import http from '@/lib/http'
import { ApiRoutes, IconNames, PageRoutes } from '@cfg'
import { Icon } from '@iconify/react'
import {
  cn,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import { useSetState } from 'ahooks'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import EmptyListPlaceholder from '../../components/EmptyListPlaceholder'
import SortTagModal from './SortTagModal'

export default function Page() {
  const [colorPicker, setColorPicker] = useSetState({
    isOpen: false,
    defaultValue: '' as string | null,
    targetTagId: 0,
  })
  const router = useRouter()

  const { tags, mutateTags, refreshTags } = useGlobalContext()

  async function remove(tag: SelectPublicTag) {
    const res = await http.delete(ApiRoutes.Public.TAG, { id: tag.id })
    if (res.error) return
    toast.success('删除成功')
    refreshTags()
  }

  function getRelatingTagsName(tagsId?: number[]) {
    if (!tagsId?.length) return ''
    return tagsId
      .map((id) => tags.find((tag) => tag.id === id))
      .map((tag) => tag?.name)
      .join('、')
  }

  function handleChangeIsMain(v: boolean, tag: SelectPublicTag) {
    if (tag.isMain === v) return
    tag.isMain = v
    mutateTags([...tags])
    http.patch(ApiRoutes.Public.TAG, tag).then(() => refreshTags())
  }

  function handleChangeColor(v: string) {
    const tag = tags.find((e) => e.id === colorPicker.targetTagId)!
    if (tag.color === v) return
    tag.color = v
    mutateTags([...tags])
    http.patch(ApiRoutes.Public.TAG, tag).then(() => refreshTags())
  }

  function changeColor(tag: SelectPublicTag) {
    setColorPicker({
      isOpen: true,
      defaultValue: tag.color,
      targetTagId: tag.id,
    })
  }

  return (
    <ListPageLayout>
      <div className="mb-2 flex justify-end">
        <SortTagModal>
          <ReButton
            variant="light"
            className={cn(tags.length < 2 && 'hidden')}
            startContent={<span className={cn(IconNames.SORT, 'text-lg')} />}
          >
            标签排序
          </ReButton>
        </SortTagModal>
      </div>
      <Table aria-label="tags table">
        <TableHeader>
          <TableColumn>图标</TableColumn>
          <TableColumn>名称</TableColumn>
          <TableColumn className="max-xs:hidden">主题色</TableColumn>
          <TableColumn className="max-xs:hidden">主标签</TableColumn>
          <TableColumn>关联标签</TableColumn>
          <TableColumn>操作</TableColumn>
        </TableHeader>
        <TableBody emptyContent={<EmptyListPlaceholder href={PageRoutes.Admin.tagSlug('new')} />}>
          {tags.map((tag) => (
            <TableRow key={tag.id}>
              <TableCell className="text-3xl text-foreground-700 max-xs:text-xl">
                {tag.icon && <Icon icon={tag.icon} />}
              </TableCell>
              <TableCell className="max-xs:text-sm">{tag.name}</TableCell>
              <TableCell className="w-24 pr-8 max-xs:hidden md:w-40">
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
                <div className="truncate text-sm max-xs:max-w-[6rem]">
                  {getRelatingTagsName(tag.relatedTagIds)}
                </div>
              </TableCell>
              <TableCell>
                <ReButton
                  variant="light"
                  color="danger"
                  className="text-2xl"
                  isIconOnly
                  startContent={<span className={IconNames.TRASH} />}
                  popoverContent={
                    <div className="flex max-w-[280px] flex-col gap-4 p-4">
                      <p>确定删除标签「{tag.name}」？</p>
                      <ReButton
                        color="danger"
                        size="sm"
                        variant="shadow"
                        onClick={() => remove(tag)}
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
                  startContent={<span className={IconNames.EDIT} />}
                  onClick={() => router.push(PageRoutes.Admin.tagSlug(tag.id!))}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ColorPicker
        {...colorPicker}
        onClose={() => setColorPicker({ isOpen: false })}
        onSelect={handleChangeColor}
      />
    </ListPageLayout>
  )
}
