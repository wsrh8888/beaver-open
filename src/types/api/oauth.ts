// ==================== OAuth 配置 ====================

export interface IOAuthConfigInfo {
  appId: string
  redirectUris: string[]
  scopes: string[]
  customLogo: string
  customTitle: string
  customColor: string
  enablePkce: boolean
  tokenExpiration: number
  status: number
}

export interface IGetOAuthConfigReq {
  appId: string
}

export interface IGetOAuthConfigRes {
  config: IOAuthConfigInfo
}

export interface IUpdateOAuthConfigReq {
  appId: string
  redirectUris?: string[]
  scopes?: string[]
  customLogo?: string
  customTitle?: string
  customColor?: string
  enablePkce?: boolean
  tokenExpiration?: number
  status?: number
}

export interface IUpdateOAuthConfigRes {}
