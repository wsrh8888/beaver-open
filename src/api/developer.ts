import config from "@/config/env"
import { ajax } from "@/utils/request"

// ==================== 认证授权 ====================

export interface IGetTokenReq {
  appId: string
  appSecret: string
}

export interface IGetTokenRes {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}

export interface IRefreshTokenReq {
  refreshToken: string
}

export interface IRefreshTokenRes {
  accessToken: string
  expiresIn: number
}

// 获取访问令牌
export function getTokenApi(data: IGetTokenReq) {
  return ajax<IGetTokenRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/auth/token`,
    data
  })
}

// 刷新访问令牌
export function refreshTokenApi(data: IRefreshTokenReq) {
  return ajax<IRefreshTokenRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/auth/refresh`,
    data
  })
}

// ==================== Bot 消息 ====================

export interface IBotSendMessageReq {
  app_id: string
  conversation_id: string
  msg_type: string // text/markdown/richtext/html
  content: string
  metadata?: Record<string, any>
  idempotent_key?: string
}

export interface IBotSendMessageRes {
  message_id: string
}

export interface IBotStreamMessageReq {
  app_id: string
  conversation_id: string
  msg_type: string
}

export interface IBotStreamChunk {
  type: string
  content: string
  metadata?: Record<string, any>
}

// Bot 发送消息
export function botSendMessageApi(data: IBotSendMessageReq) {
  return ajax<IBotSendMessageRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/bot/message/send`,
    data,
    headers: {
      'X-App-ID': data.app_id
    }
  })
}

// Bot 流式发送消息（SSE）
export function botStreamMessageApi(data: IBotStreamMessageReq): EventSource {
  const params = new URLSearchParams({
    app_id: data.app_id,
    conversation_id: data.conversation_id,
    msg_type: data.msg_type
  })
  
  const url = `${config.baseAPI}/api/open/v1/bot/message/stream?${params.toString()}`
  return new EventSource(url)
}

// ==================== 消息管理 ====================

export interface ISendMessageReq {
  targetId: string
  content: string
  msgType?: string // text/image/file
  conversationType?: number // 1单聊 2群聊
}

export interface ISendMessageRes {
  msgId: string
  sendTime: number
}

export interface IRecallMessageReq {
  msgId: string
}

export interface IRecallMessageRes {
  success: boolean
}

// 发送消息
export function sendMessageApi(data: ISendMessageReq) {
  return ajax<ISendMessageRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/message/send`,
    data
  })
}

// 撤回消息
export function recallMessageApi(data: IRecallMessageReq) {
  return ajax<IRecallMessageRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/message/recall`,
    data
  })
}

// ==================== 用户管理 ====================

export interface IUserInfo {
  userId: string
  nickname: string
  avatar?: string
  phone?: string
  email?: string
}

export interface IGetUserInfoReq {
  userId: string
}

export interface IGetUserInfoRes {
  user: IUserInfo
}

export interface IGetUserListReq {
  userIds: string[]
}

export interface IGetUserListRes {
  users: IUserInfo[]
}

// 获取用户信息
export function getUserInfoApi(params: IGetUserInfoReq) {
  return ajax<IGetUserInfoRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open/v1/user/${params.userId}`
  })
}

// 批量获取用户信息
export function getUserListApi(data: IGetUserListReq) {
  return ajax<IGetUserListRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/user/list`,
    data
  })
}

// ==================== 群组管理 ====================

export interface ICreateGroupReq {
  name: string
  memberIds: string[]
  avatar?: string
}

export interface ICreateGroupRes {
  groupId: string
}

export interface IAddGroupMemberReq {
  groupId: string
  memberIds: string[]
}

export interface IAddGroupMemberRes {
  success: boolean
}

export interface IGroupInfo {
  groupId: string
  name: string
  avatar?: string
  memberCount: number
}

export interface IGetGroupInfoReq {
  groupId: string
}

export interface IGetGroupInfoRes {
  group: IGroupInfo
}

// 创建群组
export function createGroupApi(data: ICreateGroupReq) {
  return ajax<ICreateGroupRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/group/create`,
    data
  })
}

// 添加群成员
export function addGroupMemberApi(data: IAddGroupMemberReq) {
  return ajax<IAddGroupMemberRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open/v1/group/member/add`,
    data
  })
}

// 获取群组信息
export function getGroupInfoApi(params: IGetGroupInfoReq) {
  return ajax<IGetGroupInfoRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open/v1/group/${params.groupId}`
  })
}
