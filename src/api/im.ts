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
 * IM 侧接口（不是开放平台接口）。
 * 开发者控制台的门户令牌和 IM 用户令牌用同一个 Auth.AccessSecret 签发，
 * 网关 jwtAuth 解析后会注入 Beaver-User-Id，所以这里的请求只要带同一条 Token 即可，
 * 不额外引入一套登录态。
 *
 * 目前只用两处：选择人员的用户搜索、头像上传。
 */

import config from "@/config/env"
import { ajax } from "@/utils/request"
import type { ISearchImUserReq, ISearchImUserRes, IUploadFileRes } from "@/types/api/im"

const base = config.baseAPI

/** 按用户 ID / 邮箱精确查一个用户 */
export function searchImUserApi(params: ISearchImUserReq) {
  return ajax<ISearchImUserRes>({
    method: "GET",
    url: `${base}/api/friend/v1/search`,
    params
  })
}

/**
 * 图片上传：multipart 字段名服务端固定取 "file"。
 * 这里用 fetch 而不是封装的 ajax —— axios 实例默认 Content-Type 是 application/json，
 * 传 FormData 时容易被序列化成 JSON；fetch 交给浏览器自己带 boundary 最稳。
 */
export async function uploadImageFileApi(file: File): Promise<IUploadFileRes> {
  const form = new FormData()
  form.append("file", file)
  const token = localStorage.getItem("token") || ""
  const resp = await fetch(`${base}/api/file/v1/upload`, {
    method: "POST",
    headers: token ? { Token: token } : undefined,
    body: form
  })
  const json = (await resp.json()) as { code: number; msg: string; result?: IUploadFileRes }
  if (json.code !== 0) throw new Error(json.msg || "图片上传失败")
  if (!json.result?.fileKey) throw new Error("图片上传失败：服务端未返回文件标识")
  return json.result
}

/** 头像 / 图片统一成可直接给 img 用的地址：完整 URL 原样返回，裸 fileKey 走 preview 接口 */
export function resolveImageUrl(raw?: string): string {
  const value = (raw || "").trim()
  if (!value) return ""
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value
  return `${base}/api/file/preview/${value}`
}
