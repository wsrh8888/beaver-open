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

// 数字伙伴：一级实体，对应服务端 open_digital 表。
// AppSecret 明文仅 external 创建或重置时返回一次；详情返回掩码。
// 注意：服务端门户未提供数字伙伴删除接口，前端不提供删除操作。
//
// 产品口径：编排有三种形态，与后端 runtime oneof 一一对应：
// - 提示词（builtin）：平台托管运行，配置人设、模型、工具与知识；
// - 长链接接入（external）：第三方服务通过长连接（WebSocket）接入，平台只签发凭据、转发消息；
// - 工作流（workflow）：由工作流驱动，节点编排在「编排」分区配置。

export type DigitalVisibility = "private" | "partial" | "public"
export type DigitalRuntime = "builtin" | "external" | "workflow"

export interface IDigitalInfo {
  digitalId: string
  name: string
  avatar?: string
  /** 工号：数字伙伴在组织里的成员工号，空=未申请。 */
  workId?: string
  description: string
  runtime: DigitalRuntime
  visibility: DigitalVisibility
  /** 1 启用 / 0 停用（服务端 OpenDigital.Status，建表默认 1）。这是启用开关，不是发布状态；服务端目前没有发布流程 */
  status?: number
  appKey?: string
  appSecret?: string // 掩码；仅 external 有
  adminIds?: string[]
  viewerIds?: string[]
  /** 编排配置里的引用数量，列表卡片直接展示 */
  toolCount?: number
  knowledgeCount?: number
  mcpCount?: number
  createdAt: number
  updatedAt?: number
}

export interface ICreateDigitalReq {
  name: string
  description?: string
  avatar?: string
  workId?: string
  runtime: DigitalRuntime
  visibility?: DigitalVisibility
}
export interface ICreateDigitalRes {
  digitalId: string
  appKey?: string
  appSecret?: string
}

export interface IListDigitalReq {
  page?: number
  pageSize?: number
}
export interface IListDigitalRes {
  total: number
  list: IDigitalInfo[]
}

export interface IGetDigitalDetailReq {
  digitalId: string
}
export interface IGetDigitalDetailRes {
  digital: IDigitalInfo
}

export interface IUpdateDigitalReq {
  digitalId: string
  name?: string
  avatar?: string
  workId?: string
  /** 申请平台分配工号（已有工号时服务端忽略） */
  applyWorkId?: boolean
  description?: string
  visibility?: DigitalVisibility
  /** 编排方式可随时切换；切换会保留旧配置不删 */
  runtime?: DigitalRuntime
}
export interface IUpdateDigitalRes {
  /** 切换到长链接接入且此前无凭据时，一次性返回明文 */
  appKey?: string
  appSecret?: string
}

export interface IDeleteDigitalReq {
  digitalId: string
}
export interface IDeleteDigitalRes {}

export interface IResetDigitalSecretReq {
  digitalId: string
}
export interface IResetDigitalSecretRes {
  appSecret: string
}

export interface ISetDigitalMembersReq {
  digitalId: string
  userIds: string[]
}
export interface ISetDigitalMembersRes {}

// 编排配置：按 runtime 三选一，字段为 JSON 字符串。
// 服务端 save 每次只认当前 runtime 对应那一列，所以各分区保存都必须提交整份配置。
export interface IGetDigitalConfigReq {
  digitalId: string
}
export interface IGetDigitalConfigRes {
  digitalId: string
  runtime: DigitalRuntime
  builtinConfig?: string
  externalConfig?: string
  workflowConfig?: string
}
export interface ISaveDigitalConfigReq {
  digitalId: string
  builtinConfig?: string
  externalConfig?: string
  workflowConfig?: string
}
export interface ISaveDigitalConfigRes {}

// 知识源是 open_knowledge_source 表里的后端一等实体，归某个数字伙伴所有，
// 只持有 platform 索引集合的引用（新建时由后端建集合）；合并去重后的 knowledgeIds
// 才是运行时实际检索的列表，由服务端按知识源表重算回填，前端不直接提交。
// 在线文档由用户粘贴海狸内部地址导入，正文与索引由 platform 侧异步拉取。
// 知识源相关的类型定义都在 types/api/knowledge.ts。

/* ==================== 工具与 MCP 目录 ==================== */

export interface IDigitalTool {
  toolId: string
  name: string
  /** builtin | mcp | api */
  toolType: string
  /** official | custom */
  source: string
  status: number
  config?: string
}

export interface IDigitalMcpServer {
  mcpServerId: string
  name: string
  serverName: string
  /** stdio | sse | websocket */
  transport: string
  source: string
  status: number
  config?: string
  /** 工具清单 JSON */
  tools?: string
}

export interface IListDigitalCatalogRes {
  tools: IDigitalTool[]
  mcpServers: IDigitalMcpServer[]
}

export interface ISaveDigitalMcpReq {
  digitalId: string
  /** 空 = 新建 */
  mcpServerId?: string
  name?: string
  serverName?: string
  /** stdio | sse | websocket */
  transport?: string
  /** 连接配置 JSON */
  config?: string
  /** 能力清单 JSON */
  tools?: string
}
export interface ISaveDigitalMcpRes {
  mcpServerId: string
}

export interface IDeleteDigitalMcpReq {
  digitalId: string
  mcpServerId: string
}
export interface IDeleteDigitalMcpRes {}
