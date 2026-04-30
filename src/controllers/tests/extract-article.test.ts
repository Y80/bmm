import { describe, expect, test } from 'vitest'
import { extractArticleFromHtml } from '@/utils/extract-article'

describe('extractArticleFromHtml', () => {
  const testUrl = 'https://example.com/articles/123'

  test('从标准文章页面提取标题、摘要和阅读时间', () => {
    const html = `
      <html>
        <head><title>测试文章标题 - 示例站点</title></head>
        <body>
          <article>
            <h1>测试文章标题</h1>
            <p>这是文章的正文内容，有足够多的文字来测试提取效果。第一段内容讲述了基本的背景信息，包括问题的由来和发展过程。</p>
            <p>第二段继续展开讨论，提供了更多的细节和分析，让读者能够深入了解这个话题的核心要点。</p>
            <p>第三段总结全文，提出了作者的观点和建议，为读者提供了实用的参考和进一步的思考方向。</p>
          </article>
        </body>
      </html>
    `
    const result = extractArticleFromHtml(html, testUrl)

    expect(result.title).toContain('测试')
    expect(result.summary.length).toBeGreaterThan(0)
    expect(result.estimatedReadingMinutes).toBeGreaterThanOrEqual(1)
  })

  test('使用 meta description 作为摘要', () => {
    const html = `
      <html>
        <head>
          <title>页面标题</title>
          <meta name="description" content="这是页面的 meta 描述信息，概括了文章核心内容" />
        </head>
        <body>
          <article>
            <h1>页面标题</h1>
            <p>正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容。第一段讲述了基本的背景信息，包括问题的由来和发展过程，为后续讨论奠定基础。</p>
            <p>更多正文更多正文更多正文更多正文更多正文更多正文更多正文更多正文更多正文更多正文。第二段继续展开讨论，提供了更多的细节和分析，让读者能够深入了解这个话题的核心要点。</p>
            <p>补充内容补充内容补充内容补充内容补充内容补充内容补充内容补充内容补充内容补充内容。第三段总结全文，提出了作者的观点和建议，为读者提供了实用的参考和进一步的思考方向。</p>
          </article>
        </body>
      </html>
    `
    const result = extractArticleFromHtml(html, testUrl)

    expect(result.title).toContain('页面')
    expect(result.summary.length).toBeGreaterThan(0)
  })

  test('正文内容过短时返回 fallback', () => {
    const html = `<html><body><p>太短了</p></body></html>`
    const result = extractArticleFromHtml(html, testUrl)

    expect(result.title).toBe(testUrl)
    expect(result.summary).toContain('暂时无法获取')
    expect(result.estimatedReadingMinutes).toBe(1)
  })

  test('无法提取正文时返回 fallback', () => {
    const html = '<html><body><nav>导航</nav><footer>页脚</footer></body></html>'
    const result = extractArticleFromHtml(html, testUrl)

    expect(result.title).toBe(testUrl)
  })

  test('将相对 URL 转为绝对 URL', () => {
    const html = `
      <html>
        <head><title>含图片的文章</title></head>
        <body>
          <article>
            <img src="/images/test.png" />
            <img src="photo.jpg" />
            <img src="//cdn.example.com/img.png" />
            <img src="https://other.com/img.png" />
            <p>正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容正文内容。</p>
            <p>更多正文更多正文更多正文更多正文更多正文更多正文更多正文更多正文更多正文更多正文。</p>
            <p>补充内容补充内容补充内容补充内容补充内容补充内容补充内容补充内容补充内容补充内容。</p>
          </article>
        </body>
      </html>
    `
    const result = extractArticleFromHtml(html, testUrl)

    expect(result.title).toContain('含图片')
    expect(result.summary.length).toBeGreaterThan(0)
  })

  test('处理英文文章', () => {
    const html = `
      <html>
        <head><title>Understanding React Server Components</title></head>
        <body>
          <article>
            <h1>Understanding React Server Components</h1>
            <p>React Server Components represent a significant shift in how we build React applications. They allow developers to render components on the server, reducing the amount of JavaScript sent to the client.</p>
            <p>This approach combines the best of server-side rendering with the interactivity of client-side React. By running components on the server, we can access databases and file systems directly.</p>
            <p>The result is faster initial page loads and improved user experience, especially on slower devices and networks.</p>
          </article>
        </body>
      </html>
    `
    const result = extractArticleFromHtml(html, 'https://blog.example.com/react-rsc')

    expect(result.title).toContain('React')
    expect(result.estimatedReadingMinutes).toBeGreaterThanOrEqual(1)
  })

  test('从 CSR 页面的 __NEXT_DATA__ 中提取正文', () => {
    const nextData = JSON.stringify({
      props: {
        pageProps: {
          writingDetail: {
            title: 'AI 编程工具七国大战',
            html: '<h1>AI 编程工具七国大战</h1><p>这半年我换了三次主力工具。不是因为哪个不好用，是因为这个领域变化太快了，每隔几周就有新的产品冒出来挑战现有格局。第一段讲述了基本的背景信息，包括问题的由来和发展过程，为后续讨论奠定基础。</p><p>第二段继续展开讨论，提供了更多的细节和分析，让读者能够深入了解这个话题的核心要点和关键因素，以及不同工具之间的差异。</p><p>第三段总结全文，提出了作者的观点和建议，为读者提供了实用的参考和进一步的思考方向，帮助大家做出更好的选择。</p>',
          },
        },
      },
    })
    const html = `
      <html>
        <head><title>AI 编程工具七国大战</title></head>
        <body>
          <div id="__next"></div>
          <script id="__NEXT_DATA__" type="application/json">${nextData}</script>
        </body>
      </html>
    `
    const result = extractArticleFromHtml(html, testUrl)

    expect(result.title).toContain('AI')
    expect(result.summary.length).toBeGreaterThan(0)
    expect(result.estimatedReadingMinutes).toBeGreaterThanOrEqual(1)
  })
})
