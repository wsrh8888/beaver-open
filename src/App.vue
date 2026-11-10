<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-open-header-v1
-->

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn"
import { useRouter } from "vue-router"
import { useUserStore } from "@/pinia/user/user"
import { ElMessage } from "element-plus"

export default defineComponent({
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    onMounted(async () => {
      userStore.initUserInfo()

      // hash 路由下 OAuth 回调的 code 在 # 前的 search 里，任意页面都可能收到
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get("code")
      const error = searchParams.get("error")
      if (!code && !error) return

      const clearParams = () => {
        const url = new URL(window.location.href)
        url.search = ""
        window.history.replaceState({}, "", `${url.pathname}${url.hash}`)
      }

      if (error) {
        ElMessage.error(`授权失败: ${error}`)
        clearParams()
        router.replace("/login")
        return
      }
      if (!code) return

      try {
        const result = await userStore.oauthLogin({ code })
        clearParams()
        if (result.success) {
          ElMessage.success("登录成功")
          router.replace("/dashboard")
        }
      } catch (err: any) {
        clearParams()
        ElMessage.error(err?.message || "登录失败")
        router.replace("/login")
      }
    })

    return {
      zhCn
    }
  }
})
</script>

<style>
/* 全局 reset 统一在 styles/global.css，此处不再重复声明，避免抹掉组件默认间距 */
</style>
