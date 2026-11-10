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
  IListKnowledgeBaseRes,
  ISaveKnowledgeBaseReq,
  ISaveKnowledgeBaseRes,
  IDeleteKnowledgeBaseReq,
  IListKnowledgeDocReq,
  IListKnowledgeDocRes,
  ISaveKnowledgeDocReq,
  ISaveKnowledgeDocRes,
  IDeleteKnowledgeDocReq,
  IRetrieveKnowledgeReq,
  IRetrieveKnowledgeRes,
  IListKnowledgeSourceReq,
  IListKnowledgeSourceRes,
  ISaveKnowledgeSourceReq,
  ISaveKnowledgeSourceRes,
  IDeleteKnowledgeSourceReq,
  IBindKnowledgeSourceReq,
  IBindKnowledgeSourceRes,
  IUnbindKnowledgeSourceReq,
  IUnbindKnowledgeSourceRes,
  IListKnowledgeSourceDocReq,
  IListKnowledgeSourceDocRes,
  IRetrieveKnowledgeSourceReq,
  IRetrieveKnowledgeSourceRes
} from "@/types/api/knowledge"

/**
 * 平台知识库 API：归开发者所有、跨智能体复用的集合 + 文档 + 索引配置。
 *
 * 与下面「知识源」那组接口共用 /knowledge 前缀，但语义不同：
 * 平台知识库接口一律不传 digitalId，按开发者身份直接操作平台级集合，
 * 不读取也不修改任何智能体的引用；
 * 知识源接口全部要求 digitalId，读写 open_knowledge_source 表里的实体，
 * 一个知识源可引入 N 个知识库，变更时由后端重算运行时 knowledgeIds。
 */
const base = `${config.baseAPI}/api/open_portal/digital/v1/knowledge`

export function listKnowledgeBaseApi() {
  return ajax<IListKnowledgeBaseRes>({
    method: "GET",
    url: `${base}/list`
  })
}

export function saveKnowledgeBaseApi(data: ISaveKnowledgeBaseReq) {
  return ajax<ISaveKnowledgeBaseRes>({
    method: "POST",
    url: `${base}/save`,
    data
  })
}

export function deleteKnowledgeBaseApi(data: IDeleteKnowledgeBaseReq) {
  return ajax<{}>({
    method: "POST",
    url: `${base}/delete`,
    data
  })
}

export function listKnowledgeDocApi(params: IListKnowledgeDocReq) {
  return ajax<IListKnowledgeDocRes>({
    method: "GET",
    url: `${base}/docs`,
    params
  })
}

export function saveKnowledgeDocApi(data: ISaveKnowledgeDocReq) {
  return ajax<ISaveKnowledgeDocRes>({
    method: "POST",
    url: `${base}/doc/save`,
    data
  })
}

export function deleteKnowledgeDocApi(data: IDeleteKnowledgeDocReq) {
  return ajax<{}>({
    method: "POST",
    url: `${base}/doc/delete`,
    data
  })
}

export function retrieveKnowledgeApi(data: IRetrieveKnowledgeReq) {
  return ajax<IRetrieveKnowledgeRes>({
    method: "POST",
    url: `${base}/retrieve`,
    data
  })
}

/* ==================== 知识源（后端一等实体） ==================== */

const sourceBase = `${base}/source`

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

/** 一次引入 N 个知识库 */
export function bindKnowledgeSourceApi(data: IBindKnowledgeSourceReq) {
  return ajax<IBindKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/bind`,
    data
  })
}

/** 移除其中一个知识库引用（不删知识库本体） */
export function unbindKnowledgeSourceApi(data: IUnbindKnowledgeSourceReq) {
  return ajax<IUnbindKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/unbind`,
    data
  })
}

/** 知识源详情页「文档」分区：聚合展示引入的所有知识库里的文档 */
export function listKnowledgeSourceDocApi(params: IListKnowledgeSourceDocReq) {
  return ajax<IListKnowledgeSourceDocRes>({
    method: "GET",
    url: `${sourceBase}/docs`,
    params
  })
}

/** 知识源详情页「召回测试」分区：跨所有引入的知识库检索 */
export function retrieveKnowledgeSourceApi(data: IRetrieveKnowledgeSourceReq) {
  return ajax<IRetrieveKnowledgeSourceRes>({
    method: "POST",
    url: `${sourceBase}/retrieve`,
    data
  })
}
