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

import { reactive } from "vue"

/**
 * AppSecret 明文只在创建 / 重置时返回一次。
 * 创建动作会 router.replace 换路由记录，组件可能重建，所以明文放在模块级，
 * 由「对外」分区消费并在用户确认保存后主动清空。
 */
export interface CredentialFlash {
  digitalId: string
  appKey: string
  appSecret: string
  reason: "create" | "reset"
}

export const credentialFlash = reactive<CredentialFlash>({
  digitalId: "",
  appKey: "",
  appSecret: "",
  reason: "create"
})

export function setCredentialFlash(
  digitalId: string,
  patch: Partial<Pick<CredentialFlash, "appKey" | "appSecret" | "reason">>
): void {
  credentialFlash.digitalId = digitalId
  credentialFlash.appKey = patch.appKey ?? ""
  credentialFlash.appSecret = patch.appSecret ?? ""
  credentialFlash.reason = patch.reason ?? "create"
}

export function clearCredentialFlash(): void {
  credentialFlash.digitalId = ""
  credentialFlash.appKey = ""
  credentialFlash.appSecret = ""
}
