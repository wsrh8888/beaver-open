// ==================== Webhook 配置 ====================

export interface IConfigWebhookReq {
  appId: string
  eventType: string // 主事件类型（兼容旧接口）
  targetUrl?: string
  secret?: string
  events?: string // 订阅的事件列表（JSON 字符串）
  retryCount?: number
  timeout?: number
  subscribeMode?: 'websocket' | 'webhook' // 订阅方式
}

export interface IConfigWebhookRes {
  configId: string
}

export interface IGetWebhookLogsReq {
  appId: string
  eventType?: string
  page?: number
  pageSize?: number
}

export interface IWebhookLogItem {
  id: string
  eventType: string
  payload: string
  responseCode: number
  retryCount: number
  status: number
  createdAt: number
}

export interface IGetWebhookLogsRes {
  total: number
  list: IWebhookLogItem[]
}
