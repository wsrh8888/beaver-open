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

// OAuth 登录：一级实体，对应服务端 open_oauth 表。
// 门户路由段仍叫 /open_portal/app/*，但语义已是 OAuth 应用管理，标识统一为 oauthId。

export interface IOAuthAppInfo {
  oauthId: string
  name: string
  description: string
  icon?: string
  oauthSecret: string // 服务端返回掩码
  status: number // 1 启用 / 0 禁用
  createdAt: number
}

export interface ICreateOAuthAppReq {
  name: string
  description?: string
  icon?: string
}
export interface ICreateOAuthAppRes {
  oauthId: string
  oauthSecret: string // 明文，仅创建时返回一次
}

export interface IUpdateOAuthAppReq {
  oauthId: string
  name?: string
  description?: string
  icon?: string
  status?: number
}
export interface IUpdateOAuthAppRes {}

export interface IDeleteOAuthAppReq {
  oauthId: string
}
export interface IDeleteOAuthAppRes {}

export interface IGetOAuthAppDetailReq {
  oauthId: string
}
export interface IGetOAuthAppDetailRes {
  app: IOAuthAppInfo
}

export interface IGetOAuthAppListReq {
  page?: number
  pageSize?: number
  status?: number
}
export interface IGetOAuthAppListRes {
  total: number
  list: IOAuthAppInfo[]
}

export interface IResetOAuthSecretReq {
  oauthId: string
}
export interface IResetOAuthSecretRes {
  oauthSecret: string // 明文，仅重置时返回一次
}

// OAuth 端配置：config 为 JSON 字符串，服务端按 oauthType 解析
export interface IGetOAuthConfigReq {
  oauthId: string
}
export interface IH5OAuthConfig {
  enabled: boolean
  redirectUris: string[]
  enablePKCE: boolean
}
export interface IDesktopOAuthConfig {
  enabled: boolean
  customScheme: string
  authPageUrl: string
}
export interface IMobileOAuthConfig {
  enabled: boolean
  iosBundleId: string
  androidPackageName: string
  universalLink: string
  customScheme: string
  enablePKCE: boolean
}
export interface IGetOAuthConfigRes {
  h5Config?: IH5OAuthConfig
  desktopConfig?: IDesktopOAuthConfig
  mobileConfig?: IMobileOAuthConfig
}
export interface IUpdateOAuthConfigReq {
  oauthId: string
  oauthType: "h5" | "desktop" | "mobile"
  config: string
}
export interface IUpdateOAuthConfigRes {}
