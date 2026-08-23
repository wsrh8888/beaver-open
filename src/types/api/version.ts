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

// ==================== 版本管理 ====================

export interface ICreateVersionReq {
  appId: string
  version: string // 版本号，如 1.0.0
  description?: string // 版本说明
  visibility: 'self' | 'partial' | 'all' // 可见范围
}

export interface ICreateVersionRes {
  versionId: string
}

export interface IGetVersionListReq {
  appId: string
  page?: number
  pageSize?: number
}

export interface IVersionInfo {
  id: string
  version: string
  description: string
  visibility: 'self' | 'partial' | 'all'
  status: 'draft' | 'reviewing' | 'approved' | 'rejected' | 'published'
  capabilities: string[] // 该版本包含的能力
  createdAt: number
}

export interface IGetVersionListRes {
  total: number
  list: IVersionInfo[]
}

export interface ISubmitVersionReviewReq {
  versionId: string
}

export interface ISubmitVersionReviewRes {}

export interface IPublishVersionReq {
  versionId: string
}

export interface IPublishVersionRes {}
