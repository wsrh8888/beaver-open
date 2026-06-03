import type { ILoginReq, ILoginRes } from "@/types/auth"
import config from "@/config/env"
import { ajax } from "@/utils/request"

// 用户登录
export const loginApi = (data: ILoginReq) =>{
  return ajax<ILoginRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/auth_public/v1/login`,
    data
  })
}

// OAuth 授权码登录（code 由服务端换 token，appSecret 不下发前端）
export const oauthLoginApi = (data: { code: string }) => {
  return ajax<ILoginRes>({
    method: "POST",
    url: `${config.baseAPI}/api/open_portal/auth_public/v1/oauth_login`,
    data
  })
}
