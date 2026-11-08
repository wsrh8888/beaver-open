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
  ICreateBotReq,
  ICreateBotRes,
  IListBotReq,
  IListBotRes,
  IGetBotDetailReq,
  IGetBotDetailRes,
  IUpdateBotReq,
  IUpdateBotRes,
  IDeleteBotReq,
  IDeleteBotRes,
  IResetBotSecretReq,
  IResetBotSecretRes,
  ISetBotMembersReq,
  ISetBotMembersRes
} from "@/types/api/bot"

// 群通知机器人（服务端 open_portal/api/bot.api）
export function createBotApi(data: ICreateBotReq) {
  return ajax<ICreateBotRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/create`,
    data
  })
}

export function listBotsApi(params: IListBotReq) {
  return ajax<IListBotRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/bot/v1/list`,
    params
  })
}

export function getBotDetailApi(params: IGetBotDetailReq) {
  return ajax<IGetBotDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/bot/v1/detail`,
    params
  })
}

export function updateBotApi(data: IUpdateBotReq) {
  return ajax<IUpdateBotRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/update`,
    data
  })
}

export function deleteBotApi(data: IDeleteBotReq) {
  return ajax<IDeleteBotRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/delete`,
    data
  })
}

export function resetBotSecretApi(data: IResetBotSecretReq) {
  return ajax<IResetBotSecretRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/reset_secret`,
    data
  })
}

export function setBotAdminsApi(data: ISetBotMembersReq) {
  return ajax<ISetBotMembersRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/admins/set`,
    data
  })
}

export function setBotViewersApi(data: ISetBotMembersReq) {
  return ajax<ISetBotMembersRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/bot/v1/viewers/set`,
    data
  })
}
