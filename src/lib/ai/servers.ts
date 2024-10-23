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
export const getServer = (): ServerConfig => {
  const server = env.AI_SERVER
  switch (server) {
    case 'coze':
      return coze()
    case 'openai':
      return openai()
    case 'ollama':
      return ollama()
    case 'deepseek':
      return deepseek()
    default:
      return coze()
  }
}

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

function ollama(): ServerConfig {
  if (!env.OLLAMA_URL || !env.OLLAMA_MODEL) {
    throw new Error('请配置环境变量 OLLAMA_URL、OLLAMA_MODEL')
  }
  return {
    responseContentPath: 'response',
    sendRequest(content) {
      return commonFetch({
        url: `${env.OLLAMA_URL}/api/generate`,
        token: '', // Ollama 不需要 token，但为了满足 CommonFetchParams 类型要求，传入一个空字符串
        body: {
          model: env.OLLAMA_MODEL, // 使用环境变量中的模型名称
          prompt: content, // Ollama 使用 'prompt' 而不是 'messages',
          format: 'json',
          stream: false,
        },
      })
    },
  }
}

function deepseek(): ServerConfig {
  if (!env.DEEPSEEK_API_KEY) {
    throw new Error('请配置环境变量 DEEPSEEK_API_KEY')
  }
  return {
    responseContentPath: 'choices[0].message.content',
    sendRequest(content) {
      return commonFetch({
        url: `https://api.deepseek.com/chat/completions`,
        token: env.DEEPSEEK_API_KEY!, // 添加非空断言操作符
        body: {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content }],
          stream: false,
        },
      })
    },
  }
}

// 可添加更多 AI 服务商...
