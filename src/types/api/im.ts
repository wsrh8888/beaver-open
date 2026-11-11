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

/** 用户搜索（friend 域）：按用户 ID 或邮箱精确查一个用户 */
export interface ISearchImUserReq {
  keyword: string
  /** userId=按用户ID / email=按邮箱，默认 email */
  type?: "userId" | "email"
}
export interface ISearchImUserRes {
  userId: string
  nickName: string
  /** 头像，可能是完整 URL，也可能是 fileKey */
  avatar: string
  email?: string
  abstract?: string
}

/** 文件上传（file 域），multipart 字段名固定为 file */
export interface IUploadFileRes {
  fileKey: string
  fileUrl?: string
  originalName: string
}
