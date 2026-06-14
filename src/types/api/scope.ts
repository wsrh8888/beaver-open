// ==================== 权限管理（对标飞书/钉钉）====================

export interface IScopeInfo {
  scope: string // 权限标识
  name: string // 权限名称
  description: string // 权限描述
  enabled: boolean // 是否已启用
  required: boolean // 是否需要审核
}

export interface IGetAppScopesReq {
  appId: string
}

export interface IGetAppScopesRes {
  scopes: IScopeInfo[]
}

export interface IUpdateAppScopesReq {
  appId: string
  scopes: string[] // 权限标识列表
}

export interface IUpdateAppScopesRes {}
