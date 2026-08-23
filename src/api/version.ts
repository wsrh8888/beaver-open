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
  ICreateVersionReq,
  ICreateVersionRes,
  IGetVersionListReq,
  IGetVersionListRes,
  ISubmitVersionReviewReq,
  ISubmitVersionReviewRes,
  IPublishVersionReq,
  IPublishVersionRes
} from "@/types/api/version"

// ==================== 版本管理 ====================

// 创建新版本
export function createVersionApi(data: ICreateVersionReq) {
  return ajax<ICreateVersionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/version/v1/create`,
    data
  })
}

// 获取版本列表
export function getVersionListApi(params: IGetVersionListReq) {
  return ajax<IGetVersionListRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/version/v1/list`,
    params
  })
}

// 提交版本审核
export function submitVersionReviewApi(data: ISubmitVersionReviewReq) {
  return ajax<ISubmitVersionReviewRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/version/v1/submit_review`,
    data
  })
}

// 发布版本
export function publishVersionApi(data: IPublishVersionReq) {
  return ajax<IPublishVersionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/version/v1/publish`,
    data
  })
}
