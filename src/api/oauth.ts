import config from "@/config/env"
import { ajax } from "@/utils/request"
import type {
  IGetOAuthConfigReq,
  IGetOAuthConfigRes,
  IUpdateOAuthConfigReq
} from "@/types/api/oauth"

/**
 * 获取 OAuth 配置
 */
export function getOAuthConfigApi(params: IGetOAuthConfigReq) {
  return ajax<IGetOAuthConfigRes>({
    method: "GET",
    url: `${config.baseAPI}/api/open_portal/oauth/v1/config`,
    params
  })
}

/**
 * 更新 OAuth 配置
 */
export function updateOAuthConfigApi(data: IUpdateOAuthConfigReq) {
  return ajax({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/oauth/v1/config_update`,
    data
  })
}
