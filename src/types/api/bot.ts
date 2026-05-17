// ==================== Bot 机器人配置 ====================

export interface IBotConfigInfo {
  appId: string
  botName: string
  botAvatar: string
  botDescription: string
  usageGuide: string // 使用说明
  enableSingleChat: boolean
  enableGroupChat: boolean
  enableAtMention: boolean
  enableMenu: boolean // 是否启用自定义菜单
  menuItems: string // JSON 字符串，菜单项配置
  autoReplyRules: string[]
  commands: string[]
  status: number
}

export interface IGetBotConfigReq {
  appId: string
}

export interface IGetBotConfigRes {
  config: IBotConfigInfo
}

export interface IUpdateBotConfigReq {
  appId: string
  botName?: string
  botAvatar?: string
  botDescription?: string
  usageGuide?: string // 使用说明
  enableSingleChat?: boolean
  enableGroupChat?: boolean
  enableAtMention?: boolean
  enableMenu?: boolean // 是否启用自定义菜单
  menuItems?: string // JSON 字符串，菜单项配置
  autoReplyRules?: string[]
  commands?: string[]
  status?: number
}

export interface IUpdateBotConfigRes {}

// ==================== Incoming Webhook 管理 ====================

export interface IIncomingWebhookInfo {
  id: string
  token: string
  appId: string
  groupId: string
  botUserId: string
  name: string
  webhookUrl: string
  status: number
  createdAt: number
}

export interface ICreateIncomingWebhookReq {
  appId: string
  groupId: string
  name?: string
}

export interface ICreateIncomingWebhookRes {
  webhook: IIncomingWebhookInfo
}

export interface IListIncomingWebhooksReq {
  appId: string
  page?: number
  pageSize?: number
}

export interface IListIncomingWebhooksRes {
  total: number
  list: IIncomingWebhookInfo[]
}

export interface IDeleteIncomingWebhookReq {
  id: string
}

export interface IDeleteIncomingWebhookRes {}
