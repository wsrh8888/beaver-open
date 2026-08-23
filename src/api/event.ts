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

import config from "@/config/env"
import { ajax } from "@/utils/request"

// ==================== 事件类型定义 ====================

export interface ICreateEventSubscriptionReq {
  appId: string
  eventType: string
  targetUrl: string
  secret?: string
  retryCount?: number
  timeout?: number
}

export interface IEventSubscriptionInfo {
  id: string
  appId: string
  eventType: string
  targetUrl: string
  secret: string
  status: number
  retryCount: number
  timeout: number
  createdAt: number
  updatedAt: number
}

export interface ICreateEventSubscriptionRes {
  subscription: IEventSubscriptionInfo
}

export interface IListEventSubscriptionsReq {
  appId: string
  eventType?: string
  page?: number
  pageSize?: number
}

export interface IListEventSubscriptionsRes {
  total: number
  list: IEventSubscriptionInfo[]
}

export interface IUpdateEventSubscriptionReq {
  id: string
  targetUrl?: string
  secret?: string
  status?: number
  retryCount?: number
  timeout?: number
}

export interface IUpdateEventSubscriptionRes {}

export interface IDeleteEventSubscriptionReq {
  id: string
}

export interface IDeleteEventSubscriptionRes {}

// ==================== API 方法 ====================

// 创建事件订阅
export function createEventSubscriptionApi(data: ICreateEventSubscriptionReq) {
  return ajax<ICreateEventSubscriptionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/event/v1/create`,
    data
  })
}

// 获取事件订阅列表
export function listEventSubscriptionsApi(params: IListEventSubscriptionsReq) {
  return ajax<IListEventSubscriptionsRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/event/v1/list`,
    params
  })
}

// 更新事件订阅
export function updateEventSubscriptionApi(data: IUpdateEventSubscriptionReq) {
  return ajax<IUpdateEventSubscriptionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/event/v1/update`,
    data
  })
}

// 删除事件订阅
export function deleteEventSubscriptionApi(data: IDeleteEventSubscriptionReq) {
  return ajax<IDeleteEventSubscriptionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/event/v1/delete`,
    data
  })
}
