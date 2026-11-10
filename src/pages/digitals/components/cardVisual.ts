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
 *
 * 卡片首字母图标与配色，工具箱 / MCP / 知识源三处共用。
 * 移植自 cloud-console 的视觉约定，保持跨模块一致。
 */

const ICON_TINTS = ["#e8f3ff", "#e8faf0", "#fff7e8", "#f3e8ff", "#ffe8f0", "#e8fffb"]
const ICON_INKS = ["#1d4ed8", "#1a7f4b", "#a9660a", "#7c3aed", "#be185d", "#0d9488"]

export function iconLetter(name: string): string {
  return (name || "?").trim().slice(0, 1).toUpperCase()
}

export function iconTint(seed: string): string {
  let n = 0
  for (let i = 0; i < seed.length; i++) {
    n += seed.charCodeAt(i)
  }
  return ICON_TINTS[n % ICON_TINTS.length]
}

/** 与 iconTint 同序的暗色文字，保证浅底卡片首字母图标可读性。 */
export function iconColorFor(seed: string): string {
  let n = 0
  for (let i = 0; i < seed.length; i++) {
    n += seed.charCodeAt(i)
  }
  return ICON_INKS[n % ICON_INKS.length]
}

/** 把 http(s) 端点收敛成 host 展示，出错时原样返回。 */
export function shortUrl(url: string): string {
  if (!url) return "—"
  try {
    const u = new URL(url)
    return u.host + u.pathname.replace(/\/$/, "")
  } catch {
    return url
  }
}
