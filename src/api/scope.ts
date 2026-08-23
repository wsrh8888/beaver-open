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
  IGetAppScopesReq,
  IGetAppScopesRes,
  IUpdateAppScopesReq,
  IUpdateAppScopesRes
} from "@/types/api/scope"

export type {
  IScopeInfo,
  IGetAppScopesReq,
  IGetAppScopesRes,
  IUpdateAppScopesReq,
  IUpdateAppScopesRes
} from "@/types/api/scope"

// ==================== 权限管理（对标飞书/钉钉）====================

// 获取应用权限列表
export function getAppScopesApi(params: IGetAppScopesReq) {
  return ajax<IGetAppScopesRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/app/v1/scopes`,
    params
  })
}

// 更新应用权限
export function updateAppScopesApi(data: IUpdateAppScopesReq) {
  return ajax<IUpdateAppScopesRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/app/v1/scopes/update`,
    data
  })
}
