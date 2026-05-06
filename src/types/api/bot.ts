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
