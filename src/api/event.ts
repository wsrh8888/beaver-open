import config from "@/config/env"
import { ajax } from "@/utils/request"

// ==================== 事件类型定义 ====================

export interface ICreateEventSubscriptionReq {
  appId: string
  eventType: string
  targetUrl: string
  secret?: string
  retryCount?: number
  timeout?: number
}

export interface IEventSubscriptionInfo {
  id: string
  appId: string
  eventType: string
  targetUrl: string
  secret: string
  status: number
  retryCount: number
  timeout: number
  createdAt: number
  updatedAt: number
}

export interface ICreateEventSubscriptionRes {
  subscription: IEventSubscriptionInfo
}

export interface IListEventSubscriptionsReq {
  appId: string
  eventType?: string
  page?: number
  pageSize?: number
}

export interface IListEventSubscriptionsRes {
  total: number
  list: IEventSubscriptionInfo[]
}

export interface IUpdateEventSubscriptionReq {
  id: string
  targetUrl?: string
  secret?: string
  status?: number
  retryCount?: number
  timeout?: number
}

export interface IUpdateEventSubscriptionRes {}

export interface IDeleteEventSubscriptionReq {
  id: string
}

export interface IDeleteEventSubscriptionRes {}

// ==================== API 方法 ====================

// 创建事件订阅
export function createEventSubscriptionApi(data: ICreateEventSubscriptionReq) {
  return ajax<ICreateEventSubscriptionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/event/v1/create`,
    data
  })
}

// 获取事件订阅列表
export function listEventSubscriptionsApi(params: IListEventSubscriptionsReq) {
  return ajax<IListEventSubscriptionsRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/event/v1/list`,
    params
  })
}

// 更新事件订阅
export function updateEventSubscriptionApi(data: IUpdateEventSubscriptionReq) {
  return ajax<IUpdateEventSubscriptionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/event/v1/update`,
    data
  })
}

// 删除事件订阅
export function deleteEventSubscriptionApi(data: IDeleteEventSubscriptionReq) {
  return ajax<IDeleteEventSubscriptionRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/event/v1/delete`,
    data
  })
}
