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

// ==================== OAuth 配置管理 ====================

export interface IUpdateOAuthConfigReq {
  appId: string
  oauthType: 'h5' | 'desktop' | 'mobile'
  config: string // JSON 字符串
}

export interface IUpdateOAuthConfigRes {}

export interface IGetOAuthConfigReq {
  appId: string
}

export interface IH5OAuthConfig {
  enabled: boolean
  redirectUris: string[]
  jsSdkDomains?: string[]
}

export interface IDesktopOAuthConfig {
  enabled: boolean
  customScheme: string
  authPageUrl?: string // 授权页面完整 URL（服务端生成）
}

export interface IMobileOAuthConfig {
  enabled: boolean
  iosBundleId: string
  androidPackageName: string
  universalLink: string
  customScheme: string
}

export interface IGetOAuthConfigRes {
  // 所有平台的 OAuth 配置（一次性返回）
  h5Config?: IH5OAuthConfig
  desktopConfig?: IDesktopOAuthConfig
  mobileConfig?: IMobileOAuthConfig
}
