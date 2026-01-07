import fetchHtml from '@/utils/fetch-html'
import { createOpenAIChatCompletion } from './providers'
import { chatResultAdapter, chatResultAdapter2, createPayload } from './utils'

/**
 * 分析网站，自动打标签、获取标题、描述、图标地址
 */
export async function analyzeWebsite(inputUrl: string, tags: string[]) {
  let { html, url } = await fetchHtml(inputUrl)
  const payload = await createPayload({ html, url, tags })
  const userContent = `
你是一个熟悉 Web HTML、拥有丰富的 SEO 优化经验、可以熟练地提炼归纳信息的高级人工智能机器人。

我将会给你一份 JSON，它有这些 Key：
- url: 待分析网站的链接地址
- head: 待分析网站的 HTML 文档的 <head> 的内容。
- innerText: 待分析网站的 HTML 文档的 <body> 的 innerText，不同元素下的文本会用 / 分隔。
- tags: 一组标签，使用 / 分隔。

请你根据提供的 head 和 innerText 推断这个网站的主题、内容、目标群体。并且以此执行下面 4 个任务：

Task1 为网站取一个简短、直观、明了的标题，结果存储在 {{title}} 中，同时要注意：
- 参考 <head> 中的 <title> 标签内容。
- 减少商业营销性质的文字。
- 如果你有更好的网站标题候选，就用你的，否则可以直接用 <title> 的内容。
- 文本长度控制在 20 字之内。

Task2 给网站一段简短、直观、明了的介绍，结果存储在 {{description}} 中，同时要注意：
- 参考 <head> 中的 <meta name="description"> 标签的 content 内容。
- 减少商业营销性质的文字。
- 文本长度不超过 100 字。
- 请避免太过宽泛的描述。

Task3 分析网站的图标地址，结果存储在 {{favicon}} 中，请注意：
- 结果必须以 http 起始
- 如果结果以 / 起始，请使用传入的 url 与其拼接作为正确结果

Task4 从传入的 JSON 的 tags 中找到和这个网站主题最为相关若干个标签，结果存储在 {{tags}} 中，同时要注意：
- 你可以将标签和网站的相关性打个分，分值介于 1～100，数字越大代表相关性越强。
- 入选得分大于 80 的标签。
- 从 tags 中最终选出的标签个数最多为 5 个。
- 如果 tags 中的标签的相关性得分都很低，即你认为这些标签和网站相关性都很低，可以一个也不入选。
- 如果你认为有其他标签，虽然不在 tags 中的标签中但是和当前网站相关度很高，也可以返回，但是最多 2 个。
- 最终结果为字符串数组，例如：["A", "B", ...]。

将处理结果以 JSON 格式输出，并且有以下 key：
- title 值为 {{title}}。
- description 值为 {{description}}。
- tags 值为 {{tags}}。
- favicon 值为 {{favicon}}。

以下是你需要分析的 JSON:
${JSON.stringify(payload)}
`.replace(/(\\)|(\s{2,})/g, '')
  process.env.AI_DEBUG && console.log(userContent)

  const res = await createOpenAIChatCompletion([
    {
      role: 'system',
      content:
        '你是一个熟悉 Web HTML、拥有丰富的 SEO 优化经验、可以熟练地提炼归纳信息的高级人工智能机器人。',
    },
    {
      role: 'user',
      content: userContent,
    },
  ])
  const answer = res.choices[0].message.content
  if (!answer) {
    throw new Error('AI 响应异常')
  }
  return chatResultAdapter(answer)
}

/**
 * 传入一个标签名称，从数据库中读取所有标签名称，根据名字语义分析和传入标签相关的书签
 */
export async function analyzeRelatedTags(tag: string, tags: string[]) {
  const payload = {
    targetTag: tag,
    tags,
  }
  if (!payload.tags.length) {
    throw new Error('数据库标签数据为空，请先创建标签再调用当前 AI 功能')
  }
  const content = `
我将会给你一份 JSON，它有这些 Key：
- targetTag: 目标标签
- tags: 一组标签，使用 / 分隔。

请你执行以下任务：

Task1 请你从传入的 tags 中找到 targetTag 最为相关的若干个标签，结果存储在 {{relatedTags}} 中，同时要注意：
- 你可以将待比较标签和 targetTag 的相关性打个分，分值介于 1～100，数字越大代表相关性越强。
- 入选得分大于 80 的标签。
- 从 tags 中最终选出的标签个数最多为 5 个。
- 如果 tags 中的标签的相关性得分都很低，即你认为这些标签和 targetTag 相关性都很低，可以一个也不入选。
- 如果你认为有其他标签，虽然不在 tags 中的标签中但是和 targetTag 相关度很高，也可以返回，但是最多 2 个。
- 最终结果为字符串数组，例如：["A", "B", ...]。

Task2 请你根据你对传入的 targetTag 的理解，再根据其对应的常见的 logo、品牌色，告诉我一个和 targetTag 最为相关的主题色，使用 HEX 色值格式，将结果存储在 {{themeColor}} 中。

将处理结果以 JSON 格式输出，并且有以下 key：
- relatedTags 值为 {{relatedTags}}。
- color 值为 {{themeColor}}。

以下是你需要分析的 JSON:
${JSON.stringify(payload)}
`.replace(/(\\)|(\s{2,})/g, '')

  process.env.AI_DEBUG && console.log(content)
  const res = await createOpenAIChatCompletion([
    {
      role: 'user',
      content: content,
    },
  ])
  const answer = res.choices[0].message.content
  if (!answer) {
    throw new Error('AI 响应异常')
  }
  return chatResultAdapter2(answer)
}
