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
 * 平台知识库：与智能体详情里的「知识源」是两套东西。
 * 知识库 = platform 域的集合 + 文档 + 索引配置，归开发者所有，跨智能体复用；
 * 知识源 = open 库里的后端一等实体（open_knowledge_source 表），归某个智能体所有，
 *          一个知识源可引入 N 个知识库，只存 collectionId 引用，不复制文档。
 * 知识源不再是 builtinConfig JSON 里的本地分组；运行时按所有知识源合并去重后的
 * knowledgeIds 检索，这一列由后端在知识源变更时自动回写，前端不直接提交。
 */

export interface IKnowledgeBase {
  collectionId: string
  name: string
  description: string
  kind: string
  /** 1 启用 / 2 停用 */
  status: number
  /** 检索条数（indexConfig.top_k），0 = 平台默认 */
  topK: number
  documentCount: number
  /** 原始 indexConfig JSON，设置页回显分段/检索参数 */
  indexConfig?: string
}

export interface IListKnowledgeBaseRes {
  total: number
  list: IKnowledgeBase[]
}

export interface ISaveKnowledgeBaseReq {
  /** 空 = 新建 */
  collectionId?: string
  name?: string
  description?: string
  topK?: number
  /** JSON 字符串；只覆盖传入的键，不会清掉向量模型配置 */
  indexConfig?: string
}
export interface ISaveKnowledgeBaseRes {
  collectionId: string
}

export interface IDeleteKnowledgeBaseReq {
  collectionId: string
}

export interface IKnowledgeDoc {
  documentId: string
  title: string
  docType: string
  byteSize: number
  /** pending | indexing | ready | failed */
  indexStatus: string
  indexError?: string
  indexedAt: number
}

export interface IListKnowledgeDocReq {
  collectionId: string
  keyword?: string
}
export interface IListKnowledgeDocRes {
  total: number
  list: IKnowledgeDoc[]
}

export interface ISaveKnowledgeDocReq {
  /** 新建时必填 */
  collectionId?: string
  /** 空 = 新建 */
  documentId?: string
  title: string
  contentText?: string
  /** 不改正文只重建索引 */
  reindex?: boolean
}
export interface ISaveKnowledgeDocRes {
  documentId: string
}

export interface IDeleteKnowledgeDocReq {
  documentId: string
}

export interface IKnowledgeHit {
  documentId: string
  title: string
  chunkIndex: number
  content: string
  score: number
}
export interface IRetrieveKnowledgeReq {
  collectionId: string
  query: string
  topK?: number
}
export interface IRetrieveKnowledgeRes {
  hits: IKnowledgeHit[]
  /** 无结果的原因（未配置向量模型 / 无命中等） */
  notice?: string
}

/* ==================== 知识源（后端一等实体） ====================
 * 接口全部带 digitalId，服务端会校验数字伙伴归属。
 * 一个知识源可以引入 N 个知识库，同一个知识库也能被不同知识源引入。
 */

export interface IKnowledgeSourceItem {
  knowledgeSourceId: string
  name: string
  /** 召回条数，服务端默认 8 */
  retrievalTopK: number
  /** 分段 / 清洗配置 JSON 字符串 */
  indexConfig?: string
  /** 引入的平台知识库 ID 列表 */
  knowledgeIds: string[]
  /** 引入的所有知识库的文档总数 */
  documentCount: number
  /** 秒级时间戳 */
  createdAt: number
}

export interface IListKnowledgeSourceReq {
  digitalId: string
}
export interface IListKnowledgeSourceRes {
  total: number
  list: IKnowledgeSourceItem[]
}

/** knowledgeSourceId 为空 = 新建；name/topK/indexConfig 不传 = 不改 */
export interface ISaveKnowledgeSourceReq {
  digitalId: string
  knowledgeSourceId?: string
  name?: string
  retrievalTopK?: number
  /** JSON 字符串 */
  indexConfig?: string
}
export interface ISaveKnowledgeSourceRes {
  knowledgeSourceId: string
}

export interface IDeleteKnowledgeSourceReq {
  digitalId: string
  knowledgeSourceId: string
}

/** 一次引入多个知识库，服务端会去重并过滤掉已删除的库 */
export interface IBindKnowledgeSourceReq {
  digitalId: string
  knowledgeSourceId: string
  knowledgeIds: string[]
}
export interface IBindKnowledgeSourceRes {
  /** 变更后该知识源的完整引用列表 */
  knowledgeIds: string[]
}

export interface IUnbindKnowledgeSourceReq {
  digitalId: string
  knowledgeSourceId: string
  collectionId: string
}
export interface IUnbindKnowledgeSourceRes {
  knowledgeIds: string[]
}

/** 知识源引入的所有知识库里的文档（聚合视图，只读） */
export interface IKnowledgeSourceDoc {
  documentId: string
  title: string
  docType: string
  byteSize: number
  /** pending | indexing | ready | failed */
  indexStatus: string
  indexError?: string
  indexedAt: number
  collectionId: string
  collectionName: string
}
export interface IListKnowledgeSourceDocReq {
  digitalId: string
  knowledgeSourceId: string
  keyword?: string
}
export interface IListKnowledgeSourceDocRes {
  total: number
  list: IKnowledgeSourceDoc[]
}

export interface IKnowledgeSourceHit {
  documentId: string
  collectionId: string
  collectionName: string
  title: string
  chunkIndex: number
  content: string
  score: number
}
export interface IRetrieveKnowledgeSourceReq {
  digitalId: string
  knowledgeSourceId: string
  query: string
  /** 不传 = 用知识源自身的 retrievalTopK */
  topK?: number
}
export interface IRetrieveKnowledgeSourceRes {
  hits: IKnowledgeSourceHit[]
  /** 无结果原因 */
  notice?: string
}
