import { Accordion, AccordionItem } from '@heroui/react'

export default function ExportBookmarksGuide() {
  return (
    <div className="mt-8 text-sm">
      <Accordion
        variant="shadow"
        className="border-divider/70 bg-default-100/85 dark:bg-content2/85 rounded-2xl border shadow-sm"
      >
        <AccordionItem
          aria-label="export-bookmarks-guide"
          title="教程：如何导出浏览器书签"
          classNames={{
            base: 'bg-transparent',
            title: 'text-foreground-700 text-sm font-medium',
            trigger: 'cursor-pointer px-4',
            content: 'text-foreground-500 px-4 pb-4 text-left',
          }}
        >
          <div>以 Chrome 浏览器为例：</div>
          <ol className="my-4 ml-8 list-decimal space-y-2">
            <li>在浏览器右上角，依次选择「更多」图标 &gt; 书签和清单 &gt; 书签管理器。</li>
            <li>在打开的页面顶部，依次选择「更多」图标 &gt; 导出书签。</li>
          </ol>
          <div className="mb-4">Chrome 会将你的书签导出为 HTML 文件。</div>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
