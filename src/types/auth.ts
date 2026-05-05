// 登录请求参数
export interface ILoginReq {
  username: string  // 邮箱
  password: string
}

// 用户信息
export interface IUserInfo {
  id: number
  phone: string
  email: string
  fileName: string
}

// 登录响应数据 - 匹配 open_portal API 返回结构
export interface ILoginRes {
  token: string
  userId: string
  nickName: string
  expireAt: number
}

// API通用响应结构
export interface IApiResponse<T = any> {
  code: number
  msg: string
  result: T
}

// 认证/获取用户信息响应 - 匹配authentication接口返回值
export interface IGetUserInfoRes {
  userId: string
}

// 刷新token响应
export interface IRefreshTokenRes {
  token: string
}
