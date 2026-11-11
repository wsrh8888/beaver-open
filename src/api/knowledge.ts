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

import config from "@/config/env"
import { ajax } from "@/utils/request"
import type {
  IListKnowledgeSourceReq,
  IListKnowledgeSourceRes,
  ISaveKnowledgeSourceReq,
  ISaveKnowledgeSourceRes,
  IDeleteKnowledgeSourceReq,
  IListKnowledgeSourceDocReq,
  IListKnowledgeSourceDocRes,
  IImportKnowledgeSourceDocReq,
  IImportKnowledgeSourceDocRes,
  IDeleteKnowledgeSourceDocReq,
  IDeleteKnowledgeSourceDocRes,
  IRetrieveKnowledgeSourceReq,
  IRetrieveKnowledgeSourceRes,
  IDetailKnowledgeSourceReq,
  IDetailKnowledgeSourceRes,
  ICheckKnowledgeSourceDocReq,
  ICheckKnowledgeSourceDocRes,
  IUploadKnowledgeSourceDocReq,
  IUploadKnowledgeSourceDocRes
} from "@/types/api/knowledge"

/**
 * 知识源 API：全部带 digitalId，服务端会校验数字伙伴归属。
 * 知识源是 open_knowledge_source 表里的后端实体，归某个数字伙伴所有，
 * 只持有 platform 索引集合的引用；在线文档由用户粘贴海狸内部地址导入。
 */
const sourceBase = `${config.baseAPI}/api/open_portal/digital/v1/knowledge/source`

export function listKnowledgeSourceApi(params: IListKnowledgeSourceReq) {
  return ajax<IListKnowledgeSourceRes>({
    method: "GET",
    url: `${sourceBase}/list`,
    params
  })
}

/** knowledgeSourceId 为空时创建，非空时按传入的部分字段更新 */
export function saveKnowledgeSourceApi(data: ISaveKnowledgeSourceReq) {
  return ajax<ISaveKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/save`,
    data
  })
}

export function deleteKnowledgeSourceApi(data: IDeleteKnowledgeSourceReq) {
  return ajax<{}>({
    method: "POST",
    url: `${sourceBase}/delete`,
    data
  })
}

/** 单个知识源详情：进入 /digitals/:digitalId/knowledge/:knowledgeSourceId 子路由时按 id 取回实体 */
export function detailKnowledgeSourceApi(params: IDetailKnowledgeSourceReq) {
  return ajax<IDetailKnowledgeSourceRes>({
    method: "GET",
    url: `${sourceBase}/detail`,
    params
  })
}

/** 检查在线文档 / 表格链接：解析 doc_id + 鉴权，只校验不建引用。检查通过才允许确认导入 */
export function checkKnowledgeSourceDocApi(data: ICheckKnowledgeSourceDocReq) {
  return ajax<ICheckKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/doc/check`,
    data
  })
}

/** 本地文件上传：docx/xlsx 读成 base64 传上来，服务端解析正文后建 file 文档 */
export function uploadKnowledgeSourceDocApi(data: IUploadKnowledgeSourceDocReq) {
  return ajax<IUploadKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/doc/upload`,
    data
  })
}

/** 知识源详情页「文档」分区：列出该集合下的在线文档引用 */
export function listKnowledgeSourceDocApi(params: IListKnowledgeSourceDocReq) {
  return ajax<IListKnowledgeSourceDocRes>({
    method: "GET",
    url: `${sourceBase}/docs`,
    params
  })
}

/** 导入在线文档：粘贴海狸内部在线文档地址，后端解析 + 鉴权后建立引用 */
export function importKnowledgeSourceDocApi(data: IImportKnowledgeSourceDocReq) {
  return ajax<IImportKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/doc/import`,
    data
  })
}

/** 删除知识源里的一条在线文档引用（不动在线文档本体） */
export function deleteKnowledgeSourceDocApi(data: IDeleteKnowledgeSourceDocReq) {
  return ajax<IDeleteKnowledgeSourceDocRes>({
    method: "POST",
    url: `${sourceBase}/doc/delete`,
    data
  })
}

/** 知识源详情页「召回测试」分区 */
export function retrieveKnowledgeSourceApi(data: IRetrieveKnowledgeSourceReq) {
  return ajax<IRetrieveKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/retrieve`,
    data
  })
}
