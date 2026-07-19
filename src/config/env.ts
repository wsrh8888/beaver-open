/**
 * 环境配置
 */
export const config = {
  env: import.meta.env.VITE_API_ENV,
  baseAPI: import.meta.env.VITE_API_BASE,
  apiApi: import.meta.env.VITE_API_API,
  oauthBaseUrl: import.meta.env.VITE_OAUTH_BASE_URL,
  oauthRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  openAppId: import.meta.env.VITE_OPEN_APP_ID,
}

console.info('🚀 当前环境:', config.env)
console.info('🌐 API地址:', config.baseAPI)
console.info('🔐 OAuth:', config.oauthBaseUrl, '→', config.oauthRedirectUri)

export default config
