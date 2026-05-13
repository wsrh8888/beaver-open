// ==================== 版本管理 ====================

export interface ICreateVersionReq {
  appId: string
  version: string // 版本号，如 1.0.0
  description?: string // 版本说明
  visibility: 'self' | 'partial' | 'all' // 可见范围
}

export interface ICreateVersionRes {
  versionId: string
}

export interface IGetVersionListReq {
  appId: string
  page?: number
  pageSize?: number
}

export interface IVersionInfo {
  id: string
  version: string
  description: string
  visibility: 'self' | 'partial' | 'all'
  status: 'draft' | 'reviewing' | 'approved' | 'rejected' | 'published'
  capabilities: string[] // 该版本包含的能力
  createdAt: number
}

export interface IGetVersionListRes {
  total: number
  list: IVersionInfo[]
}

export interface ISubmitVersionReviewReq {
  versionId: string
}

export interface ISubmitVersionReviewRes {}

export interface IPublishVersionReq {
  versionId: string
}

export interface IPublishVersionRes {}
