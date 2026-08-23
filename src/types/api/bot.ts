/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-open
 * https://github.com/wsrh8888/beaver-open
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-open-header-v1
 */

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
