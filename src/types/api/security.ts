// ==================== 安全设置 ====================

export interface IUpdateSecurityConfigReq {
  appId: string
  ipWhitelist?: string[] // IP白名单
  redirectUris?: string[] // OAuth重定向URL白名单
  trustedDomains?: string[] // H5可信域名
}

export interface IUpdateSecurityConfigRes {}

export interface IGetSecurityConfigReq {
  appId: string
}

export interface ISecurityConfigInfo {
  appId: string
  ipWhitelist: string[] // IP白名单
  redirectUris: string[] // OAuth重定向URL
  trustedDomains: string[] // H5可信域名
}

export interface IGetSecurityConfigRes {
  config: ISecurityConfigInfo
}
