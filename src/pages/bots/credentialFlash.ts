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
 * 推送机器人的接入凭据只在创建时返回一次：详情接口里的 webhookUrl 已把 token 脱敏成 ***，
 * token 本身只存哈希，事后无法重建。所以创建返回的这一份必须暂存在模块级，
 * 由「开发者选项」消费，用户确认保存后主动清空。
 *
 * 列表页创建成功后 router.push 到详情，组件会重建，放模块级才不会丢。
 */
export interface BotCredentialFlash {
  botId: string
  webhookUrl: string
  token: string
  secret: string
}

export const botCredentialFlash = reactive<BotCredentialFlash>({
  botId: "",
  webhookUrl: "",
  token: "",
  secret: ""
})

export function setBotCredentialFlash(
  botId: string,
  patch: Pick<BotCredentialFlash, "webhookUrl" | "token" | "secret">
): void {
  botCredentialFlash.botId = botId
  botCredentialFlash.webhookUrl = patch.webhookUrl
  botCredentialFlash.token = patch.token
  botCredentialFlash.secret = patch.secret
}

export function clearBotCredentialFlash(): void {
  botCredentialFlash.botId = ""
  botCredentialFlash.webhookUrl = ""
  botCredentialFlash.token = ""
  botCredentialFlash.secret = ""
}
