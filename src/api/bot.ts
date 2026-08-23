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
import type {
  IGetBotConfigReq,
  IGetBotConfigRes,
  IUpdateBotConfigReq,
  IUpdateBotConfigRes,
  ICreateIncomingWebhookReq,
  ICreateIncomingWebhookRes,
  IListIncomingWebhooksReq,
  IListIncomingWebhooksRes,
  IDeleteIncomingWebhookReq,
  IDeleteIncomingWebhookRes
} from "@/types/api/bot"

// ==================== Bot 机器人配置 ====================

// 获取 Bot 配置
export function getBotConfigApi(params: IGetBotConfigReq) {
  return ajax<IGetBotConfigRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/bot/v1/config`,
    params
  })
}

// 更新 Bot 配置
export function updateBotConfigApi(data: IUpdateBotConfigReq) {
  return ajax<IUpdateBotConfigRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/config_update`,
    data
  })
}

// ==================== Incoming Webhook 管理 ====================

// 创建 Incoming Webhook
export function createIncomingWebhookApi(data: ICreateIncomingWebhookReq) {
  return ajax<ICreateIncomingWebhookRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/incoming_create`,
    data
  })
}

// 获取 Incoming Webhook 列表
export function listIncomingWebhooksApi(params: IListIncomingWebhooksReq) {
  return ajax<IListIncomingWebhooksRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/bot/v1/incoming_list`,
    params
  })
}

// 删除 Incoming Webhook
export function deleteIncomingWebhookApi(data: IDeleteIncomingWebhookReq) {
  return ajax<IDeleteIncomingWebhookRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/incoming_delete`,
    data
  })
}
