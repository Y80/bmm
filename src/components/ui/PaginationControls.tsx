'use client'

import { Pagination, Select, SelectItem } from '@heroui/react'

function getSelectionKey(selection: unknown) {
  if (selection instanceof Set) {
    const [key] = Array.from(selection)
    return key ? String(key) : ''
  }
  if (selection && typeof selection === 'object' && 'currentKey' in selection) {
    return String((selection as { currentKey?: string }).currentKey || '')
  }
  return ''
}

type PaginationControlsProps = {
  page: number
  total: number
  pageSize: number
  pageSizeOptions: readonly number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export default function PaginationControls(props: PaginationControlsProps) {
  function changePageSize(value: string) {
    const nextPageSize = Number(value)
    if (!nextPageSize) return
    props.onPageSizeChange(nextPageSize)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
      {props.total > 1 && (
        <Pagination
          showShadow
          showControls
          page={props.page}
          total={props.total}
          onChange={props.onPageChange}
        />
      )}
      <Select
        aria-label="选择每页条数"
        className="w-[120px]"
        size="sm"
        selectedKeys={[String(props.pageSize)]}
        renderValue={() => `${props.pageSize} 条/页`}
        onSelectionChange={(val) => changePageSize(getSelectionKey(val))}
        onChange={(event) => changePageSize(event.target.value)}
      >
        {props.pageSizeOptions.map((size) => (
          <SelectItem key={String(size)} textValue={`${size} 条/页`}>
            {size} 条/页
          </SelectItem>
        ))}
      </Select>
    </div>
  )
}
