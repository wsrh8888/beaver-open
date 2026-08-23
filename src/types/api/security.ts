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

// ==================== 安全设置 ====================

export interface IUpdateSecurityConfigReq {
  appId: string
  ipWhitelist?: string[] // IP白名单
  redirectUris?: string[] // OAuth重定向URL白名单
  trustedDomains?: string[] // H5可信域名
}

export interface IUpdateSecurityConfigRes {}

export interface IGetSecurityConfigReq {
  appId: string
}

export interface ISecurityConfigInfo {
  appId: string
  ipWhitelist: string[] // IP白名单
  redirectUris: string[] // OAuth重定向URL
  trustedDomains: string[] // H5可信域名
}

export interface IGetSecurityConfigRes {
  config: ISecurityConfigInfo
}
