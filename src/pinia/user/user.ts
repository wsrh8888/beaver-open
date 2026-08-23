/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-open
 * https://github.com/wsrh8888/beaver-open
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-open-header-v1
 */

import type { IApiResponse, ILoginReq, ILoginRes } from "@/types/auth"
import { defineStore } from "pinia"
import { loginApi, oauthLoginApi } from "@/api/auth"

export const useUserStore = defineStore("useUserStore", {
  state: () => ({
    token: localStorage.getItem("token") || "",
    userId: localStorage.getItem("userId") || "",
    nickName: localStorage.getItem("nickName") || "",
    userInfo: null as any
  }),

  getters: {
    // 是否已登录
    isLoggedIn: state => !!state.token,

    // 获取用户显示名称
    displayName: state => state.nickName || "未登录"
  },

  actions: {
    // 设置token
    setToken(token: string) {
      this.token = token
      localStorage.setItem("token", token)
    },

    // 设置用户ID
    setUserId(userId: string) {
      this.userId = userId
      localStorage.setItem("userId", userId)
    },

    // 设置昵称
    setNickName(nickName: string) {
      this.nickName = nickName
      localStorage.setItem("nickName", nickName)
    },

    // 设置用户信息
    setUserInfo(userInfo: any) {
      this.userInfo = userInfo
    },

    // 登录
    async login(loginData: ILoginReq) {
      try {
        const response: IApiResponse<ILoginRes> = await loginApi(loginData)

        if (response.code === 0) {
          const { token, userId, nickName } = response.result

          this.setToken(token)
          this.setUserId(userId)
          this.setNickName(nickName)

          return { success: true, data: response.result }
        } else {
          throw new Error(response.msg || "登录失败")
        }
      } catch (error: any) {
        throw new Error(error.message || "登录失败")
      }
    },

    // OAuth 授权码登录
    async oauthLogin(data: { code: string }) {
      try {
        const response: IApiResponse<ILoginRes> = await oauthLoginApi(data)

        if (response.code === 0) {
          const { token, userId, nickName } = response.result

          this.setToken(token)
          this.setUserId(userId)
          this.setNickName(nickName)

          return { success: true, data: response.result }
        }

        throw new Error(response.msg || "登录失败")
      } catch (error: any) {
        throw new Error(error.message || "登录失败")
      }
    },

    // 登出
    logout() {
      this.token = ""
      this.userId = ""
      this.nickName = ""
      this.userInfo = null
      localStorage.removeItem("token")
      localStorage.removeItem("userId")
      localStorage.removeItem("nickName")
    },

    // 初始化用户信息 - 页面刷新时调用
    async initUserInfo() {
      // open_portal 登录后已返回完整用户信息，无需额外调用
      // 如果后续需要刷新用户信息，可以添加对应的 API
      if (this.token && !this.nickName) {
        // 如果有 token 但没有昵称，可能需要重新登录
        console.warn("用户信息不完整，建议重新登录")
      }
    }
  }
})
