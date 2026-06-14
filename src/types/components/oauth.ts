// OAuth 组件类型定义

export interface IOAuthClientConfig {
  enabled: boolean
  redirectUris?: string[]
}

export interface IH5OAuthConfig extends IOAuthClientConfig {
  // H5 特有配置（暂无）
}

export interface IDesktopOAuthConfig extends IOAuthClientConfig {
  customScheme?: string
}

export interface IMobileOAuthConfig extends IOAuthClientConfig {
  iosBundleId?: string
  androidPackageName?: string
  universalLink?: string
  customScheme?: string
}

export interface IOAuthConfig {
  h5: IH5OAuthConfig
  desktop: IDesktopOAuthConfig
  mobile: IMobileOAuthConfig
}
