import type { createReadLaterArticlePayload, createWebsiteAnalysisPayload } from './payload'

type WebsiteAnalysisPayload = ReturnType<typeof createWebsiteAnalysisPayload>
type ReadLaterArticlePayload = ReturnType<typeof createReadLaterArticlePayload>

export const analyzeWebsiteSystemPrompt =
  '你是一个书签信息整理助手，擅长从网页 HTML 中提炼准确、克制、适合收藏管理的标题、简介、图标和标签。'

export function createAnalyzeWebsitePrompt(payload: WebsiteAnalysisPayload) {
  return `
你需要把一个网页整理成适合保存到书签管理器里的结构化信息。

输入 JSON 字段说明：
- url: 实际抓取到的网页地址。
- head: 网页 <head> 内容，可能包含 title、description、favicon、Open Graph 等元信息。
- innerText: 网页正文可见文本，文本片段用 / 分隔，可能包含导航、页脚、广告等噪声。
- tags: 当前系统已有标签，只能从这里选择标签。

请综合两类信息判断这个网页最核心的用途、内容和目标用户：
- 用户传入的 JSON 信息，包括 url、head、innerText 和 tags。
- 你已有的、与该 url、域名、品牌、产品或开源项目相关的常识性知识。

综合时请遵守：
- 以用户传入的 JSON 为主要依据，已有知识只用于补全、纠偏和消除网页噪声。
- 如果已有知识与 JSON 内容明显冲突，优先相信 JSON 内容。
- 不要编造无法从 URL、网页内容或常识性知识合理推出的信息。

请返回一个 JSON 对象：

{
  "title": "适合作为书签名称的标题",
  "description": "适合作为书签描述的中文简介",
  "tags": ["从输入 tags 中选择的标签"],
  "favicon": "绝对地址形式的图标 URL，无法判断则为空字符串"
}

字段要求：
- title: 3 到 30 个字符。优先使用产品名、项目名、网站名或页面主题；删除“官网”“首页”“最新”“免费试用”等营销或导航词；不要包含标语、长句或多余分隔符。
- description: 20 到 100 个中文字符。说明这个网站能做什么、适合谁使用；不要照搬广告语；不要使用“这是一个网站”“该平台提供”等空泛开头；如果原文是英文，请用自然中文概括。
- tags: 只能从输入 tags 中选择，最多 5 个；按相关性从高到低排序；不确定就返回空数组；不要创造新标签，不要翻译标签名。
- favicon: 必须是 http 或 https 开头的绝对 URL；如果候选图标是相对路径，请基于 url 转成绝对 URL；无法从 head 中可靠判断时返回空字符串。

输出要求：
- 只输出一个合法 JSON 对象。
- 不要输出 Markdown 代码块。
- 不要输出解释、注释或额外文本。
- 不要把字段值写成 null，未知内容使用空字符串或空数组。

以下是你需要分析的 JSON:
${JSON.stringify(payload)}
`
}

export function createAnalyzeRelatedTagsPrompt(payload: { targetTag: string; tags: string[] }) {
  return `
你需要为一个书签标签推荐相关标签，并给这个标签选择一个合适的主题色和图标。

输入 JSON 字段说明：
- targetTag: 当前正在分析的目标标签。
- tags: 当前系统已有标签，只能从这里选择相关标签。

请综合两类信息判断：
- 用户传入的 targetTag 和 tags。
- 你已有的、与 targetTag 涉及的技术、产品、品牌、领域或语义相关的常识性知识。

综合时请遵守：
- 以用户传入的 targetTag 和 tags 为主要依据，已有知识只用于理解标签含义和判断相关性。
- relatedTags 只能从输入 tags 中选择，不能创造新标签，不能翻译标签名。
- 不要返回 targetTag 自身。
- 如果某个标签只是字面相近但语义关系弱，不要选择。
- 如果相关性不确定，宁可少选或返回空数组。

相关性判断优先级：
1. 同一技术栈、工具链、框架生态、品牌产品线或直接上下游关系。
2. 常见搭配使用、替代方案、插件扩展、部署运行环境或学习路径相关。
3. 同一大领域下的强相关主题。
4. 仅同属泛领域但联系较弱的标签不要选择。

请返回一个 JSON 对象：

{
  "relatedTags": ["从输入 tags 中选择的相关标签"],
  "themeColor": "#RRGGBB",
  "icon": "最符合 targetTag 语义的 Iconify 图标名称"
字段要求：
- relatedTags: 最多 5 个；按相关性从高到低排序；只包含输入 tags 中存在的字符串；没有合适项时返回空数组。
- themeColor: 使用 HEX 色值格式。优先选择 targetTag 对应品牌、产品、框架或技术社区常见主色；没有明确品牌色时，选择一个符合该标签语义且辨识度好的颜色。
- icon: 返回 Iconify 上真实存在、最符合 targetTag 名称语义的图标名称，格式为 "图标集:图标名"，例如 "tabler:ad-circle"、"simple-icons:react"、"mdi:database"；优先选择语义清晰、通用、适合标签展示的图标；不要返回 SVG、URL、emoji、HTML 或解释文本。

输出要求：
- 只输出一个合法 JSON 对象。
- 不要输出 Markdown 代码块。
- 不要输出解释、注释或额外文本。
- 不要把字段值写成 null，未知相关标签使用空数组，主题色仍需返回合法 HEX 色值，图标仍需返回合法 Iconify 图标名称。

以下是你需要分析的 JSON:
${JSON.stringify(payload)}
`
}

export const analyzeReadLaterArticleSystemPrompt =
  '你是一个稍后阅读整理助手，擅长从网页 HTML 中提炼适合阅读清单的文章标题、摘要和预计阅读用时。'

export function createAnalyzeReadLaterArticlePrompt(payload: ReadLaterArticlePayload) {
  return `
你需要把一个网页整理成适合保存到“稍后阅读”列表里的结构化信息。

输入 JSON 字段说明：
- url: 实际抓取到的网页地址。
- head: 网页 <head> 内容，可能包含 title、description、Open Graph 等元信息。
- innerText: 网页正文可见文本，可能包含导航、页脚、广告等噪声。

请综合 head、innerText 和 URL 判断正文主题。不要编造网页中无法合理推出的信息。

请返回一个 JSON 对象：

{
  "title": "文章标题",
  "summary": "中文摘要",
  "estimatedReadingMinutes": 5
}

字段要求：
- title: 3 到 50 个字符。优先使用文章标题或页面核心主题，删除站点名、营销后缀和多余分隔符。
- summary: 30 到 160 个中文字符。概括这篇内容讲什么、适合用户稍后阅读时快速回忆；如果原文是英文，请用自然中文概括。
- estimatedReadingMinutes: 正整数。按正文信息量估算阅读时间；较短内容至少返回 1。

输出要求：
- 只输出一个合法 JSON 对象。
- 不要输出 Markdown 代码块。
- 不要输出解释、注释或额外文本。
- 不要把字段值写成 null，未知时从可见文本中给出保守概括。

以下是你需要分析的 JSON:
${JSON.stringify(payload)}
`
}
