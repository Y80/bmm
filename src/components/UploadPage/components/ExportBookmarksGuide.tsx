import { Accordion, AccordionItem } from '@heroui/react'

export default function ExportBookmarksGuide() {
  return (
    <div className="mt-8 text-sm">
      <Accordion variant="shadow" className="bg-opacity-50">
        <AccordionItem
          aria-label="export-bookmarks-guide"
          title={<span className="text-sm text-foreground-600">教程：如何导出浏览器书签</span>}
          className="text-left text-foreground-500"
        >
          <div>以 Chrome 浏览器为例:</div>
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
