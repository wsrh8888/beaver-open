import config from "@/config/env"
import { ajax } from "@/utils/request"
import type {
  IGetBotConfigReq,
  IGetBotConfigRes,
  IUpdateBotConfigReq,
  IUpdateBotConfigRes,
  ICreateIncomingWebhookReq,
  ICreateIncomingWebhookRes,
  IListIncomingWebhooksReq,
  IListIncomingWebhooksRes,
  IDeleteIncomingWebhookReq,
  IDeleteIncomingWebhookRes
} from "@/types/api/bot"

// ==================== Bot 机器人配置 ====================

// 获取 Bot 配置
export function getBotConfigApi(params: IGetBotConfigReq) {
  return ajax<IGetBotConfigRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/bot/config`,
    params
  })
}

// 更新 Bot 配置
export function updateBotConfigApi(data: IUpdateBotConfigReq) {
  return ajax<IUpdateBotConfigRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/bot/config_update`,
    data
  })
}

// ==================== Incoming Webhook 管理 ====================

// 创建 Incoming Webhook
export function createIncomingWebhookApi(data: ICreateIncomingWebhookReq) {
  return ajax<ICreateIncomingWebhookRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/bot/incoming_create`,
    data
  })
}

// 获取 Incoming Webhook 列表
export function listIncomingWebhooksApi(params: IListIncomingWebhooksReq) {
  return ajax<IListIncomingWebhooksRes>({
    method: "GET",
    url: `${config.baseAPI}/portal/open/v1/bot/incoming_list`,
    params
  })
}

// 删除 Incoming Webhook
export function deleteIncomingWebhookApi(data: IDeleteIncomingWebhookReq) {
  return ajax<IDeleteIncomingWebhookRes>({
    method: "POST",
    url: `${config.baseAPI}/portal/open/v1/bot/incoming_delete`,
    data
  })
}
