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

import type { ILoginReq, ILoginRes } from "@/types/auth"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 用户登录
export const loginApi = (data: ILoginReq) =>{
  return ajax<ILoginRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/auth_public/v1/login`,
    data
  })
}

// OAuth 授权码登录（code 由服务端换 token，appSecret 不下发前端）
export const oauthLoginApi = (data: { code: string }) => {
  return ajax<ILoginRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/auth_public/v1/oauth_login`,
    data
  })
}
