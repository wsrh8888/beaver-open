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

/**
 * 环境配置
 */
export const config = {
  env: import.meta.env.VITE_API_ENV,
  baseAPI: import.meta.env.VITE_API_BASE,
  apiApi: import.meta.env.VITE_API_API,
  oauthBaseUrl: import.meta.env.VITE_OAUTH_BASE_URL,
  oauthRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  openAppId: import.meta.env.VITE_OPEN_APP_ID,
}

console.info('🚀 当前环境:', config.env)
console.info('🌐 API地址:', config.baseAPI)
console.info('🔐 OAuth:', config.oauthBaseUrl, '→', config.oauthRedirectUri)

export default config
