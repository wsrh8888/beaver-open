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
  ICreateOAuthAppReq,
  ICreateOAuthAppRes,
  IUpdateOAuthAppReq,
  IUpdateOAuthAppRes,
  IDeleteOAuthAppReq,
  IDeleteOAuthAppRes,
  IGetOAuthAppDetailReq,
  IGetOAuthAppDetailRes,
  IGetOAuthAppListReq,
  IGetOAuthAppListRes,
  IResetOAuthSecretReq,
  IResetOAuthSecretRes,
  IGetOAuthConfigReq,
  IGetOAuthConfigRes,
  IUpdateOAuthConfigReq,
  IUpdateOAuthConfigRes
} from "@/types/api/oauth"

// OAuth 应用管理（服务端 open_portal/api/app.api，操作 open_oauth 表）
export function createOAuthAppApi(data: ICreateOAuthAppReq) {
  return ajax<ICreateOAuthAppRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/create`,
    data
  })
}

export function updateOAuthAppApi(data: IUpdateOAuthAppReq) {
  return ajax<IUpdateOAuthAppRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/update`,
    data
  })
}

export function deleteOAuthAppApi(data: IDeleteOAuthAppReq) {
  return ajax<IDeleteOAuthAppRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/delete`,
    data
  })
}

export function getOAuthAppDetailApi(params: IGetOAuthAppDetailReq) {
  return ajax<IGetOAuthAppDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/app/v1/detail`,
    params
  })
}

export function getOAuthAppListApi(params: IGetOAuthAppListReq) {
  return ajax<IGetOAuthAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/app/v1/list`,
    params
  })
}

export function resetOAuthSecretApi(data: IResetOAuthSecretReq) {
  return ajax<IResetOAuthSecretRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/reset_secret`,
    data
  })
}

// OAuth 端配置（服务端 open_portal/api/oauth.api）
export function getOAuthConfigApi(params: IGetOAuthConfigReq) {
  return ajax<IGetOAuthConfigRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/oauth/v1/config`,
    params
  })
}

export function updateOAuthConfigApi(data: IUpdateOAuthConfigReq) {
  return ajax<IUpdateOAuthConfigRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/oauth/v1/config_update`,
    data
  })
}
