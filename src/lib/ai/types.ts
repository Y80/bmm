export interface ServerConfig {
  /**
   * AI 响应结构体中，目标内容的属性路径
   *
   * 例如 OpenAI /v1/chat/completions 接口返回的数据结构：
   * ```json
   * {
   *    model: "...",
   *    usage: {...},
   *    choices: [
   *      {message: {role: "...", content:"..."}, ...},
   *      ...
   *    ],
   *    ...
   * }
   * ```
   * 则 responseContentPath 应该为 'choices[0].message.content'
   */
  responseContentPath: string
  sendRequest: (content: string) => Promise<any>
}

export interface CommonFetchParams {
  /** AI 请求地址 */
  url: string
  /**  用于身份认证的 token */
  token: string
  /** 请求体 */
  body: object
  headers?: object
}

export interface CozeResponse {
  messages: {
    role: 'assistant'
    type: 'answer' | 'follow_up' | 'verbose'
    content: string
    content_type: 'text'
  }[]
  conversation_id: string
  code: number
  msg: string | 'success'
}
