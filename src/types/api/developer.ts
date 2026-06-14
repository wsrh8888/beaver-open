// ==================== 开发者管理 ====================

export interface IApplyDeveloperReq {
  realName: string
  companyName?: string
  phone: string
  email: string
  description: string
}

export interface IApplyDeveloperRes {}

export interface IDeveloperInfo {
  id: number
  userId: string
  realName: string
  companyName: string
  phone: string
  email: string
  description: string
  status: number // 0待审核 1已通过 2已拒绝
  auditBy: string
  auditTime: number
  auditRemark: string
  createdAt: number
}

export interface IGetDeveloperListReq {
  page?: number
  pageSize?: number
  status?: number
}

export interface IGetDeveloperListRes {
  total: number
  list: IDeveloperInfo[]
}

export interface IGetDeveloperDetailReq {
  id: number
}

export interface IGetDeveloperDetailRes {
  developer: IDeveloperInfo
}

export interface IAuditDeveloperReq {
  id: number
  status: number // 1通过 2拒绝
  auditRemark?: string
}

export interface IAuditDeveloperRes {}
