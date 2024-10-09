import { env } from 'process'
import { ServerConfig } from './types'
import { commonFetch } from './utils'

/**
 * 获取实际会调用的 AI 服务
 *
 * ! 注意配置相关的环境变量
 *
 * 可参考下面 coze() 和 openai() 的示例，自行接入其他 AI 服务
 */
export const getServer = coze

/**
 * 扣子 AI
 *
 * [开发指南](https://www.coze.cn/docs/developer_guides/coze_api_overview)
 */
function coze(): ServerConfig {
  if (!env.COZE_API_KEY || !env.COZE_BOT_ID) {
    throw new Error('请配置环境变量 COZE_API_KEY、COZE_BOT_ID')
  }
  return {
    responseContentPath: 'messages[0].content',
    sendRequest(content: string) {
      return commonFetch({
        url: 'https://api.coze.cn/open_api/v2/chat',
        token: process.env.COZE_API_KEY!,
        body: {
          bot_id: process.env.COZE_BOT_ID,
          user: 'user',
          query: content,
          stream: false,
        },
      })
    },
  }
}

function openai(): ServerConfig {
  if (!env.OPENAI_API_KEY) {
    throw new Error('请配置环境变量 OPENAI_API_KEY')
  }
  return {
    responseContentPath: 'choices[0].message.content',
    sendRequest(content) {
      return commonFetch({
        url: 'https://api.openai.com/v1/chat/completions',
        token: env.OPENAI_API_KEY!,
        body: {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content }],
          temperature: 0.7,
        },
      })
    },
  }
}

// 可添加更多 AI 服务商...
