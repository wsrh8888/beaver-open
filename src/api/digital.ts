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
  ICreateDigitalReq,
  ICreateDigitalRes,
  IListDigitalReq,
  IListDigitalRes,
  IGetDigitalDetailReq,
  IGetDigitalDetailRes,
  IUpdateDigitalReq,
  IUpdateDigitalRes,
  IResetDigitalSecretReq,
  IResetDigitalSecretRes,
  ISetDigitalMembersReq,
  ISetDigitalMembersRes,
  IGetDigitalConfigReq,
  IGetDigitalConfigRes,
  ISaveDigitalConfigReq,
  ISaveDigitalConfigRes,
  IDeleteDigitalReq,
  IDeleteDigitalRes,
  IListDigitalKnowledgeReq,
  IListDigitalKnowledgeRes,
  ISaveDigitalKnowledgeReq,
  ISaveDigitalKnowledgeRes,
  IDeleteDigitalKnowledgeReq,
  IDeleteDigitalKnowledgeRes,
  IListDigitalKnowledgeDocReq,
  IListDigitalKnowledgeDocRes,
  ISaveDigitalKnowledgeDocReq,
  ISaveDigitalKnowledgeDocRes,
  IDeleteDigitalKnowledgeDocReq,
  IDeleteDigitalKnowledgeDocRes,
  IRetrieveDigitalKnowledgeReq,
  IRetrieveDigitalKnowledgeRes,
  IListDigitalCatalogRes,
  ISaveDigitalMcpReq,
  ISaveDigitalMcpRes,
  IDeleteDigitalMcpReq,
  IDeleteDigitalMcpRes
} from "@/types/api/digital"

// 数字伙伴（服务端 open_portal/api/digital.api）
export function createDigitalApi(data: ICreateDigitalReq) {
  return ajax<ICreateDigitalRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/create`,
    data
  })
}

export function listDigitalsApi(params: IListDigitalReq) {
  return ajax<IListDigitalRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/digital/v1/list`,
    params
  })
}

export function getDigitalDetailApi(params: IGetDigitalDetailReq) {
  return ajax<IGetDigitalDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/digital/v1/detail`,
    params
  })
}

export function updateDigitalApi(data: IUpdateDigitalReq) {
  return ajax<IUpdateDigitalRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/update`,
    data
  })
}

export function resetDigitalSecretApi(data: IResetDigitalSecretReq) {
  return ajax<IResetDigitalSecretRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/reset_secret`,
    data
  })
}

export function deleteDigitalApi(data: IDeleteDigitalReq) {
  return ajax<IDeleteDigitalRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/delete`,
    data
  })
}

export function setDigitalAdminsApi(data: ISetDigitalMembersReq) {
  return ajax<ISetDigitalMembersRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/admins/set`,
    data
  })
}

export function setDigitalViewersApi(data: ISetDigitalMembersReq) {
  return ajax<ISetDigitalMembersRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/viewers/set`,
    data
  })
}

export function getDigitalConfigApi(params: IGetDigitalConfigReq) {
  return ajax<IGetDigitalConfigRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/digital/v1/config/get`,
    params
  })
}

export function saveDigitalConfigApi(data: ISaveDigitalConfigReq) {
  return ajax<ISaveDigitalConfigRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/config/save`,
    data
  })
}

/* ============ 知识源：平台知识库（数字伙伴只存引用 ID）============ */

export function listDigitalKnowledgeApi(params: IListDigitalKnowledgeReq) {
  return ajax<IListDigitalKnowledgeRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/digital/v1/knowledge/list`,
    params
  })
}

export function saveDigitalKnowledgeApi(data: ISaveDigitalKnowledgeReq) {
  return ajax<ISaveDigitalKnowledgeRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/knowledge/save`,
    data
  })
}

export function deleteDigitalKnowledgeApi(data: IDeleteDigitalKnowledgeReq) {
  return ajax<IDeleteDigitalKnowledgeRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/knowledge/delete`,
    data
  })
}

export function listDigitalKnowledgeDocApi(params: IListDigitalKnowledgeDocReq) {
  return ajax<IListDigitalKnowledgeDocRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/digital/v1/knowledge/docs`,
    params
  })
}

export function saveDigitalKnowledgeDocApi(data: ISaveDigitalKnowledgeDocReq) {
  return ajax<ISaveDigitalKnowledgeDocRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/knowledge/doc/save`,
    data
  })
}

export function deleteDigitalKnowledgeDocApi(data: IDeleteDigitalKnowledgeDocReq) {
  return ajax<IDeleteDigitalKnowledgeDocRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/knowledge/doc/delete`,
    data
  })
}

export function retrieveDigitalKnowledgeApi(data: IRetrieveDigitalKnowledgeReq) {
  return ajax<IRetrieveDigitalKnowledgeRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/knowledge/retrieve`,
    data
  })
}

/* ============ 工具与 MCP 目录 ============ */

export function listDigitalCatalogApi() {
  return ajax<IListDigitalCatalogRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/digital/v1/tool/catalog`
  })
}

export function saveDigitalMcpApi(data: ISaveDigitalMcpReq) {
  return ajax<ISaveDigitalMcpRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/tool/mcp/save`,
    data
  })
}

export function deleteDigitalMcpApi(data: IDeleteDigitalMcpReq) {
  return ajax<IDeleteDigitalMcpRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/digital/v1/tool/mcp/delete`,
    data
  })
}
