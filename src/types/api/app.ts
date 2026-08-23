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

// ==================== 应用管理 ====================

export interface ICreateAppReq {
  name: string
  description?: string
  icon?: string
}

export interface ICreateAppRes {
  appId: string
  appSecret: string
}

export interface IUpdateAppReq {
  appId: string
  name?: string
  description?: string
  icon?: string
  status?: number
  scheme?: string // 客户端回调协议
  logoUrl?: string // 授权页展示的应用LOGO
  agentId?: string // 微应用ID(用于JSSDK鉴权)
}

export interface IUpdateAppRes {}

export interface IDeleteAppReq {
  appId: string
}

export interface IDeleteAppRes {}

export interface IAppInfo {
  appId: string
  name: string
  description: string
  icon?: string
  appSecret: string // 应用密钥（掩码形式）
  status: number // 0=草稿，1=已发布，2=禁用
  // 能力开关（对标飞书）
  enableRobot: number // 是否启用智能机器人能力
  enableOAuth: number // 是否启用OAuth能力
  enableWebhook: number // 是否启用Webhook能力
  // 客户端配置（对标知音楼）
  scheme?: string // 客户端回调协议
  logoUrl?: string // 授权页展示的应用LOGO
  agentId?: string // 微应用ID(用于JSSDK鉴权)
  // 安全配置
  ipWhitelist?: string // IP白名单(JSON数组)
  createdAt: number
}

export interface IGetAppDetailReq {
  appId: string
}

export interface IGetAppDetailRes {
  app: IAppInfo
}

export interface IGetAppListReq {
  page?: number
  pageSize?: number
  status?: number
}

export interface IGetAppListRes {
  total: number
  list: IAppInfo[]
}

// ==================== 应用密钥管理 ====================

export interface IResetAppSecretReq {
  appId: string
}

export interface IResetAppSecretRes {
  appId: string
  appSecret: string
  message: string
}

// ==================== 应用发布（对标飞书版本发布）====================

export interface IPublishAppReq {
  appId: string
  version?: string // 版本号，如 1.0.0
  description?: string // 版本说明
}

export interface IPublishAppRes {
  status: number // 发布后状态：1已发布
}

// ==================== 应用能力管理（对标飞书）====================

export interface IToggleAppCapabilityReq {
  appId: string
  capability: 'robot' | 'oauth' | 'webhook' // 能力类型：robot/oauth/webhook
  enable: boolean // true=启用，false=禁用
}

export interface IToggleAppCapabilityRes {
  enabled: boolean // 当前状态
}
