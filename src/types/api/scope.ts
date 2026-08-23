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

// ==================== 权限管理（对标飞书/钉钉）====================

export interface IScopeInfo {
  scope: string // 权限标识
  name: string // 权限名称
  description: string // 权限描述
  enabled: boolean // 是否已启用
  required: boolean // 是否需要审核
}

export interface IGetAppScopesReq {
  appId: string
}

export interface IGetAppScopesRes {
  scopes: IScopeInfo[]
}

export interface IUpdateAppScopesReq {
  appId: string
  scopes: string[] // 权限标识列表
}

export interface IUpdateAppScopesRes {}
