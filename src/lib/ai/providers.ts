import OpenAI from 'openai'
import { env } from 'process'
import { ServerConfig } from './types'
import { commonFetch } from './utils'

function getOpenAI() {
  if (!env.OPENAI_API_KEY) {
    throw new Error('请配置环境变量 OPENAI_API_KEY')
  }
  if (!env.OPENAI_BASE_URL) {
    throw new Error('请配置环境变量 OPENAI_BASE_URL')
  }
  if (!env.OPENAI_MODEL) {
    throw new Error('请配置环境变量 OPENAI_MODEL')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  })
}

export function createOpenAIChatCompletion(messages: OpenAI.ChatCompletionMessageParam[]) {
  const openai = getOpenAI()
  return openai.chat.completions.create({
    model: process.env.OPENAI_MODEL!,
    stream: false,
    messages,
  })
}

/**
 * 扣子 AI
 *
 * [开发指南](https://www.coze.cn/docs/developer_guides/coze_api_overview)
 */
// function coze(): ServerConfig {
//   if (!env.COZE_API_KEY || !env.COZE_BOT_ID) {
//     throw new Error('请配置环境变量 COZE_API_KEY、COZE_BOT_ID')
//   }
//   return {
//     responseContentPath: 'messages[0].content',
//     sendRequest(content: string) {
//       return commonFetch({
//         url: 'https://api.coze.cn/open_api/v2/chat',
//         token: process.env.COZE_API_KEY!,
//         body: {
//           bot_id: process.env.COZE_BOT_ID,
//           user: 'user',
//           query: content,
//           stream: false,
//         },
//       })
//     },
//   }
// }

function openai(): ServerConfig {
  if (!env.OPENAI_API_KEY) {
    throw new Error('请配置环境变量 OPENAI_API_KEY')
  }
  if (!env.OPENAI_BASE_URL) {
    throw new Error('请配置环境变量 OPENAI_BASE_URL')
  }
  if (!env.OPENAI_MODEL) {
    throw new Error('请配置环境变量 OPENAI_MODEL')
  }
  return {
    responseContentPath: 'choices[0].message.content',
    sendRequest(content) {
      return commonFetch({
        url: env.OPENAI_BASE_URL!,
        token: env.OPENAI_API_KEY!,
        body: {
          model: env.OPENAI_MODEL!,
          messages: [
            {
              role: 'system',
              content:
                '你是一个熟悉 Web HTML、拥有丰富的 SEO 优化经验、可以熟练地提炼归纳信息的高级人工智能机器人。',
            },
            {
              role: 'user',
              content,
            },
          ],
        },
      })
    },
  }
}
