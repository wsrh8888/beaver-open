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
  <div class="login-redirect">
    <div class="brand">
      <svg class="brand-mark" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="0" y="0" width="24" height="24" rx="6" fill="#BF4A1B" />
        <path d="M8 6.5h4.6a3.1 3.1 0 0 1 0 6.2H8V6.5Zm0 6.2h5a3.1 3.1 0 0 1 0 6.2H8v-6.2Z" fill="#FFFFFF" />
        <path d="M8 6.5h2.2v11H8v-11Z" fill="#FFFFFF" />
      </svg>
      <span>Beaver 开放平台</span>
    </div>

    <p class="login-redirect__status">正在前往 Beaver 账号登录…</p>
    <p class="login-redirect__hint">
      如果没有自动跳转，请<a :href="authUrl" rel="noopener noreferrer">点此继续</a>。
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/pinia/user/user"
import config from "@/config/env"

export default defineComponent({
  name: "LoginPage",
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    // 授权页地址：与原登录按钮完全一致，只是不再需要用户点一下
    const authUrl = (() => {
      const url = new URL(`${config.oauthBaseUrl}/auth`)
      url.searchParams.set("appId", config.openAppId)
      url.searchParams.set("redirectUri", config.oauthRedirectUri)
      url.searchParams.set("scope", "user_info")
      return url.toString()
    })()

    onMounted(() => {
      // 已登录不停留在登录入口
      if (userStore.isLoggedIn) {
        router.replace("/console/dashboard")
        return
      }

      // OAuth 回调的 code / error 由 App.vue 全局消费，此时绝不能再跳走，
      // 否则会与授权页形成来回跳转的死循环。
      const search = new URLSearchParams(window.location.search)
      if (search.has("code") || search.has("error")) return

      // replace 而非 href：避免浏览器后退又回到本页立即再次跳转
      window.location.replace(authUrl)
    })

    return { authUrl }
  }
})
</script>

<style lang="less" scoped>
.login-redirect {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-6);
  background: var(--ds-page-bg);
  text-align: center;

  &__status {
    margin-top: var(--ds-space-4);
    font-size: var(--ds-fs-14);
    color: var(--ds-neutral-700);
  }

  &__hint {
    font-size: var(--ds-fs-12);
    color: var(--ds-neutral-600);

    a { color: var(--ds-brand); }
  }
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-2);
  font-size: 15px;
  font-weight: 600;
  color: var(--ds-neutral-900);

  .brand-mark { width: 24px; height: 24px; }
}
</style>
