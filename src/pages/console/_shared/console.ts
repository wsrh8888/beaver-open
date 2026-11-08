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

import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import type { DigitalRuntime } from "@/types/api/digital"

/** 三个一级实体共用的可见性口径（服务端 oneof=private partial public）。 */
export const VISIBILITY_OPTIONS = [
  { value: "private", label: "私有", desc: "仅管理员可见，适合内部调试" },
  { value: "partial", label: "指定成员", desc: "仅「成员与可见性」中的可见人可用" },
  { value: "public", label: "公开", desc: "全站可搜索、可被拉入会话" }
] as const

export function visibilityText(value?: string): string {
  if (value === "public") return "公开"
  if (value === "partial") return "指定成员"
  return "私有"
}

/**
 * 智能体编排只有三种形态，全站统一文案，与后端 runtime oneof 一一对应：
 * - 提示词（builtin）：走平台自有运行时，人设、模型、工具、知识都在平台配置；
 * - 长链接接入（external）：第三方服务通过长连接（WebSocket）接入，平台只签发凭据、转发消息；
 * - 工作流（workflow）：由工作流驱动，节点编排在「编排」分区配置。
 */
export function runtimeText(value?: string): string {
  if (value === "workflow") return "工作流编排"
  if (value === "external") return "长链接接入"
  return "提示词编排"
}

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

/** tab 徽标配色：builtin=成功绿，external=中性灰，workflow=品牌色。 */
export function runtimeBadge(value?: string): string {
  if (value === "external") return "ds-badge--neutral"
  if (value === "workflow") return "ds-badge--brand"
  return "ds-badge--success"
}

export function formatTime(value?: number): string {
  if (!value) return "—"
  const ms = value < 1e12 ? value * 1000 : value
  return new Date(ms).toLocaleString("zh-CN", { hour12: false })
}

/** 复制到剪贴板：优先 Clipboard API，非安全上下文降级到 execCommand。 */
export async function copyText(text: string, label = "已复制"): Promise<void> {
  if (!text) {
    ElMessage.warning("内容为空")
    return
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(el)
      if (!ok) throw new Error("execCommand copy failed")
    }
    ElMessage.success(label)
  } catch {
    ElMessage.error("复制失败，请手动选中复制")
  }
}

/**
 * 服务端把编排配置存成 JSON 字符串，读回来可能是字符串、对象或空。
 * 统一在这里解析成表单对象，任何异常都退回默认值，不让脏数据把表单打崩。
 */
export function parseConfig<T>(raw: unknown, fallback: T): T {
  let value: unknown = raw
  if (typeof raw === "string") {
    if (!raw.trim()) return fallback
    try {
      value = JSON.parse(raw)
    } catch {
      return fallback
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback
  return { ...fallback, ...(value as Record<string, unknown>) } as T
}

export function stringifyConfig(value: unknown): string {
  return JSON.stringify(value ?? {})
}

/** 工作流节点 / 连线在本地生成短 ID，只要求流程内唯一。 */
export function shortId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export interface ConsoleTab {
  key: string
  label: string
}

/**
 * 详情页 tab 与 URL 的 ?tab= 双向同步。
 * 大厂控制台的分区都是可深链的：刷新、分享、浏览器后退都保持在同一分区。
 */
export function useTabNav(tabs: ConsoleTab[], defaultKey?: string) {
  const route = useRoute()
  const router = useRouter()
  const fallback = defaultKey || tabs[0]?.key || ""
  const active = computed(() => {
    const queryTab = String(route.query.tab || "")
    return tabs.some(item => item.key === queryTab) ? queryTab : fallback
  })
  const select = (key: string) => {
    if (key === active.value) return
    router.replace({ query: { ...route.query, tab: key } })
  }
  return { active, select }
}

/** 统一的保存错误处理：接口 code !== 0 或抛异常都给出可读提示。 */
export function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

/** 运行方式 → 详情页副标题的说明文案。 */
export function runtimeDesc(runtime?: DigitalRuntime | string): string {
  if (runtime === "workflow") {
    return "由工作流驱动，节点编排在「编排」分区配置。"
  }
  if (runtime === "external") {
    return "由第三方服务通过长连接接入，平台只负责签发凭据与转发消息。"
  }
  return "由平台托管运行，配置人设提示词、模型、工具与知识源。"
}
