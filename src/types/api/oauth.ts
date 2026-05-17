// ==================== OAuth 配置管理 ====================

export interface IUpdateOAuthConfigReq {
  appId: string
  oauthType: 'h5' | 'desktop' | 'mobile'
  config: string // JSON 字符串
}

export interface IUpdateOAuthConfigRes {}

export interface IGetOAuthConfigReq {
  appId: string
  oauthType: 'h5' | 'desktop' | 'mobile'
}

export interface IH5OAuthConfig {
  enabled: boolean
  redirectUris: string[]
  jsSdkDomains?: string[]
}

export interface IDesktopOAuthConfig {
  enabled: boolean
  customScheme: string
  authPageUrl?: string // 授权页面完整 URL（服务端生成）
}

export interface IMobileOAuthConfig {
  enabled: boolean
  iosBundleId: string
  androidPackageName: string
  universalLink: string
  customScheme: string
}

export interface IGetOAuthConfigRes {
  oauthType: string
  h5Config?: IH5OAuthConfig
  desktopConfig?: IDesktopOAuthConfig
  mobileConfig?: IMobileOAuthConfig
}
