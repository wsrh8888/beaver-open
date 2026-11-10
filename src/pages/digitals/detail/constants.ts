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
 * 智能体板块自己的文案：编排三种形态与后端 runtime oneof 一一对应。
 * 只有本板块用，不进通用 utils。
 */
export function modeText(mode?: string): string {
  if (mode === "workflow") return "工作流编排"
  if (mode === "longconnect") return "长链接接入"
  return "提示词编排"
}

export function modeDesc(mode?: string): string {
  if (mode === "workflow") {
    return "智能体由工作流驱动，节点编排在「编排」分区配置。"
  }
  if (mode === "longconnect") {
    return "智能体由你自己的服务通过长连接（WebSocket）接入，平台只签发凭据、转发消息。"
  }
  return "智能体由平台托管运行，在这里配置提示词、模型、工具与知识源。"
}
