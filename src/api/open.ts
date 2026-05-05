import config from "@/config/env"
import { ajax } from "@/utils/request"

// ==================== 应用管理 ====================

export interface ICreateAppReq {
  name: string
  description?: string
  icon?: string
}

export interface ICreateAppRes {
  appId: string
  appSecret: string
  botUserId: string
}

export interface IUpdateAppReq {
  appId: string
  name?: string
  description?: string
  icon?: string
  status?: number
}

export interface IUpdateAppRes {}

export interface IDeleteAppReq {
  appId: string
}

export interface IDeleteAppRes {}

export interface IAppInfo {
  appId: string
  name: string
  description: string
  icon?: string
  status: number
  createdAt: number
}

export interface IGetAppDetailReq {
  appId: string
}

export interface IGetAppDetailRes {
  app: IAppInfo
}

export interface IGetAppListReq {
  page?: number
  pageSize?: number
  status?: number
}

export interface IGetAppListRes {
  total: number
  list: IAppInfo[]
}

// 创建应用
export function createAppApi(data: ICreateAppReq) {
  return ajax<ICreateAppRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/create`,
    data
  })
}

// 更新应用
export function updateAppApi(data: IUpdateAppReq) {
  return ajax<IUpdateAppRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/update`,
    data
  })
}

// 删除应用
export function deleteAppApi(data: IDeleteAppReq) {
  return ajax<IDeleteAppRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/delete`,
    data
  })
}

// 获取应用详情
export function getAppDetailApi(params: IGetAppDetailReq) {
  return ajax<IGetAppDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/app/detail`,
    params
  })
}

// 获取应用列表
export function getAppListApi(params: IGetAppListReq) {
  return ajax<IGetAppListRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/app/list`,
    params
  })
}

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

// 获取应用权限列表
export function getAppScopesApi(params: IGetAppScopesReq) {
  return ajax<IGetAppScopesRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/app/scopes`,
    params
  })
}

// 更新应用权限
export function updateAppScopesApi(data: IUpdateAppScopesReq) {
  return ajax<IUpdateAppScopesRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/scopes/update`,
    data
  })
}

// ==================== Bot 机器人配置 ====================

export interface IBotConfigInfo {
  appId: string
  botName: string
  botAvatar: string
  botDescription: string
  enableSingleChat: boolean
  enableGroupChat: boolean
  enableAtMention: boolean
  autoReplyRules: string[]
  commands: string[]
  status: number
}

export interface IGetBotConfigReq {
  appId: string
}

export interface IGetBotConfigRes {
  config: IBotConfigInfo
}

export interface IUpdateBotConfigReq {
  appId: string
  botName?: string
  botAvatar?: string
  botDescription?: string
  enableSingleChat?: boolean
  enableGroupChat?: boolean
  enableAtMention?: boolean
  autoReplyRules?: string[]
  commands?: string[]
  status?: number
}

export interface IUpdateBotConfigRes {}

// 获取 Bot 配置
export function getBotConfigApi(params: IGetBotConfigReq) {
  return ajax<IGetBotConfigRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/app/bot/config`,
    params
  })
}

// 更新 Bot 配置
export function updateBotConfigApi(data: IUpdateBotConfigReq) {
  return ajax<IUpdateBotConfigRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/bot/config/update`,
    data
  })
}

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

// 获取 OAuth 配置
export function getOAuthConfigApi(params: IGetOAuthConfigReq) {
  return ajax<IGetOAuthConfigRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/app/oauth/config`,
    params
  })
}

// 更新 OAuth 配置
export function updateOAuthConfigApi(data: IUpdateOAuthConfigReq) {
  return ajax<IUpdateOAuthConfigRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/oauth/config/update`,
    data
  })
}

// ==================== Webhook 配置 ====================

export interface IConfigWebhookReq {
  appId: string
  eventType: string
  targetUrl: string
  secret?: string
  retryCount?: number
  timeout?: number
}

export interface IConfigWebhookRes {
  configId: string
}

export interface IGetWebhookLogsReq {
  appId: string
  eventType?: string
  page?: number
  pageSize?: number
}

export interface IWebhookLogItem {
  id: string
  eventType: string
  payload: string
  responseCode: number
  retryCount: number
  status: number
  createdAt: number
}

export interface IGetWebhookLogsRes {
  total: number
  list: IWebhookLogItem[]
}

// 配置 Webhook
export function configWebhookApi(data: IConfigWebhookReq) {
  return ajax<IConfigWebhookRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/webhook/config`,
    data
  })
}

// 获取 Webhook 日志
export function getWebhookLogsApi(params: IGetWebhookLogsReq) {
  return ajax<IGetWebhookLogsRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/webhook/logs`,
    params
  })
}

// ==================== 应用密钥管理 ====================

export interface IResetAppSecretReq {
  appId: string
}

export interface IResetAppSecretRes {
  appId: string
  appSecret: string
  message: string
}

// 重置应用密钥
export function resetAppSecretApi(data: IResetAppSecretReq) {
  return ajax<IResetAppSecretRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/secret/reset`,
    data
  })
}

// ==================== 应用权限管理 ====================

export interface IAppPermission {
  id: number
  scope: string
  grantedAt: number
  grantedBy: string
  expiresAt: number
}

export interface IGetAppPermissionsReq {
  appId: string
}

export interface IGetAppPermissionsRes {
  permissions: IAppPermission[]
}

export interface IConfigAppPermissionReq {
  appId: string
  scopes: string[]
  expiresAt?: number
}

export interface IConfigAppPermissionRes {
  success: boolean
}

// 获取应用权限列表
export function getAppPermissionsApi(params: IGetAppPermissionsReq) {
  return ajax<IGetAppPermissionsRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/app/permissions`,
    params
  })
}

// 配置应用权限
export function configAppPermissionApi(data: IConfigAppPermissionReq) {
  return ajax<IConfigAppPermissionRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/app/permission/config`,
    data
  })
}

// ==================== 开发者管理 ====================

export interface IApplyDeveloperReq {
  realName: string
  companyName?: string
  phone: string
  email: string
  description: string
}

export interface IApplyDeveloperRes {
}

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

export interface IAuditDeveloperRes {
}

// 申请成为开发者
export function applyDeveloperApi(data: IApplyDeveloperReq) {
  return ajax<IApplyDeveloperRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/developer/apply`,
    data
  })
}

// 获取开发者列表
export function getDeveloperListApi(params: IGetDeveloperListReq) {
  return ajax<IGetDeveloperListRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/developer/list`,
    params
  })
}

// 获取开发者详情
export function getDeveloperDetailApi(params: IGetDeveloperDetailReq) {
  return ajax<IGetDeveloperDetailRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/developer/${params.id}`
  })
}

// 审核开发者申请
export function auditDeveloperApi(data: IAuditDeveloperReq) {
  return ajax<IAuditDeveloperRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/developer/audit`,
    data
  })
}

