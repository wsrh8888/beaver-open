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
  ICreateAppReq,
  ICreateAppRes,
  IUpdateAppReq,
  IUpdateAppRes,
  IDeleteAppReq,
  IDeleteAppRes,
  IGetAppDetailReq,
  IGetAppDetailRes,
  IGetAppListReq,
  IGetAppListRes,
  IResetAppSecretReq,
  IResetAppSecretRes,
  IPublishAppReq,
  IPublishAppRes,
  IToggleAppCapabilityReq,
  IToggleAppCapabilityRes,
} from "@/types/api/app"

export type {
  IAppInfo,
  ICreateAppReq,
  ICreateAppRes,
  IUpdateAppReq,
  IUpdateAppRes,
  IDeleteAppReq,
  IDeleteAppRes,
  IGetAppDetailReq,
  IGetAppDetailRes,
  IGetAppListReq,
  IGetAppListRes,
  IResetAppSecretReq,
  IResetAppSecretRes,
  IPublishAppReq,
  IPublishAppRes,
  IToggleAppCapabilityReq,
  IToggleAppCapabilityRes
} from "@/types/api/app"

// ==================== 应用管理 ====================

// 创建应用
export function createAppApi(data: ICreateAppReq) {
  return ajax<ICreateAppRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/create`,
    data
  })
}

// 更新应用
export function updateAppApi(data: IUpdateAppReq) {
  return ajax<IUpdateAppRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/update`,
    data
  })
}

// 删除应用
export function deleteAppApi(data: IDeleteAppReq) {
  return ajax<IDeleteAppRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/delete`,
    data
  })
}

// 获取应用详情
export function getAppDetailApi(params: IGetAppDetailReq) {
  return ajax<IGetAppDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/app/v1/detail`,
    params
  })
}

// 获取应用列表
export function getAppListApi(params: IGetAppListReq) {
  return ajax<IGetAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/app/v1/list`,
    params
  })
}

// 重置应用密钥
export function resetAppSecretApi(data: IResetAppSecretReq) {
  return ajax<IResetAppSecretRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/reset_secret`,
    data
  })
}

// 发布应用（对标飞书版本发布）
export function publishAppApi(data: IPublishAppReq) {
  return ajax<IPublishAppRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/publish`,
    data
  })
}

// 启用/禁用应用能力（对标飞书）
export function toggleAppCapabilityApi(data: IToggleAppCapabilityReq) {
  return ajax<IToggleAppCapabilityRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/capability/toggle`,
    data
  })
}
