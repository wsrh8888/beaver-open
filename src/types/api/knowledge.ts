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
 * 知识源：智能体详情里的后端一等实体（open_knowledge_source 表），归某个数字伙伴所有。
 *
 * 知识源只持有「引用」，不存任何文档正文：
 * - 文档正文的权威源在 doc 域在线文档库（普通用户所有，按 user_id 鉴权）；
 * - 新建知识源时在 platform 域建一个专属索引集合，用户粘贴的海狸内部在线文档地址
 *   经解析 + 鉴权后作为引用挂在这个集合上，由 platform 的 ingest 自动拉取并索引；
 * - 删除知识源 / 移除引用都不动在线文档本体。
 *
 * 一个知识源持有一个 platform 索引集合；运行时按所有知识源合并去重后的 knowledgeIds
 * 检索，这一列由后端在知识源变更时自动回写，前端不直接提交。
 */

export interface IKnowledgeSourceItem {
  knowledgeSourceId: string
  name: string
  /** 召回条数，服务端默认 8 */
  retrievalTopK: number
  /** 分段 / 清洗配置 JSON 字符串 */
  indexConfig?: string
  /** 该知识源集合下的文档总数 */
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

/** 知识源集合下的文档（即用户粘贴的在线文档引用，只读聚合视图） */
export interface IKnowledgeSourceDoc {
  documentId: string
  title: string
  docType: string
  byteSize: number
  /** pending | indexing | ready | failed */
  indexStatus: string
  indexError?: string
  indexedAt: number
  /** 引用的在线文档 doc_id */
  sourceDocId: string
  /** direct（跟随源文档更新）| import */
  syncMode: string
  /** 最近同步时间，RFC3339 字符串，可能为空 */
  lastSyncedAt?: string
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

/** 导入在线文档：粘贴海狸内部在线文档地址（URL 或裸 docId），后端解析 + 鉴权后建立引用 */
export interface IImportKnowledgeSourceDocReq {
  digitalId: string
  knowledgeSourceId: string
  /** 海狸内部在线文档地址，可多个 */
  docUrls: string[]
  /** 文档类型：doc=在线文档 / faq=Q&A 文档，默认 doc */
  docType?: "doc" | "faq"
}
export interface IImportKnowledgeSourceDocRes {
  /** 成功建立的引用数 */
  imported: number
  /** 解析或鉴权失败的地址 */
  failed?: string[]
  notice?: string
}

export interface IDeleteKnowledgeSourceDocReq {
  digitalId: string
  knowledgeSourceId: string
  documentId: string
}
export interface IDeleteKnowledgeSourceDocRes {}

export interface IKnowledgeSourceHit {
  documentId: string
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

/**
 * 分段 / 清洗配置：知识源 indexConfig 列（JSON 字符串）反序列化后的形状。
 * 添加文件向导第二步与知识源「设置」分区共用，字段与后端约定保持一致。
 */
export interface IKnowledgeIndexConfig {
  /** auto=自动分段与清洗 / custom=自定义 */
  segmentMode: "auto" | "custom"
  maxSegmentLength: number
  overlapLength: number
  removeExtraSpaces: boolean
  removeUrls: boolean
  removeEmails: boolean
  /** 目前仅 auto（系统按文档内容自动选检索方式） */
  retrievalMode: "auto"
}

export const DEFAULT_KNOWLEDGE_INDEX_CONFIG: IKnowledgeIndexConfig = {
  segmentMode: "auto",
  maxSegmentLength: 500,
  overlapLength: 50,
  removeExtraSpaces: true,
  removeUrls: true,
  removeEmails: false,
  retrievalMode: "auto"
}

/** 解析后端 indexConfig JSON 字符串，缺字段用默认值补齐 */
export function parseKnowledgeIndexConfig(raw?: string): IKnowledgeIndexConfig {
  if (!raw) return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG }
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG }
    }
    return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG, ...(parsed as Partial<IKnowledgeIndexConfig>) }
  } catch {
    return { ...DEFAULT_KNOWLEDGE_INDEX_CONFIG }
  }
}

/** 单个知识源详情：进入子路由时按 id 取回实体 */
export interface IDetailKnowledgeSourceReq {
  digitalId: string
  knowledgeSourceId: string
}
export interface IDetailKnowledgeSourceRes {
  source: IKnowledgeSourceItem
}

/** 检查在线文档链接：只解析 + 鉴权，不建立引用。检查通过才允许确认导入 */
export interface ICheckKnowledgeSourceDocReq {
  digitalId: string
  docUrl: string
}
export interface ICheckKnowledgeSourceDocRes {
  /** 链接可解析且当前用户可见 */
  valid: boolean
  /** 解析出的文档 ID */
  docId?: string
  /** 文档标题，供确认前预览 */
  title?: string
  /** 失败原因（无法解析 / 无权限） */
  msg?: string
}

/** 本地文件上传：docx/xlsx 读成 base64 传上来，服务端解析正文后建 file 文档 */
export interface IUploadKnowledgeSourceDocReq {
  digitalId: string
  knowledgeSourceId: string
  fileName: string
  /** base64 文件二进制（不含 data: 前缀） */
  data: string
  /** doc|faq，默认 doc */
  docType?: "doc" | "faq"
}
export interface IUploadKnowledgeSourceDocRes {
  documentId?: string
  title?: string
  /** 解析出的正文字节数 */
  byteSize: number
  msg?: string
}
