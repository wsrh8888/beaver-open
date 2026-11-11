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
 * 使用与商业授权说明：https://wsrh8888/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888/beaver-docs/community/license.html
 *
 * beaver-open-header-v1
 */

import { reactive } from "vue"

/**
 * OAuthSecret 明文只在创建 / 重置时返回一次，详情接口只返回掩码。
 * 创建后会 router.push 换路由，组件重建，所以明文暂存模块级，
 * 由「开发者选项」消费，用户确认保存后主动清空。
 */
export interface OAuthCredentialFlash {
  oauthId: string
  oauthSecret: string
}

export const oauthCredentialFlash = reactive<OAuthCredentialFlash>({
  oauthId: "",
  oauthSecret: ""
})

export function setOAuthCredentialFlash(oauthId: string, oauthSecret: string): void {
  oauthCredentialFlash.oauthId = oauthId
  oauthCredentialFlash.oauthSecret = oauthSecret
}

export function clearOAuthCredentialFlash(): void {
  oauthCredentialFlash.oauthId = ""
  oauthCredentialFlash.oauthSecret = ""
}
