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
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>Beaver 开放平台</h1>
        <p>使用 Beaver 账号登录</p>
      </div>
      
      <el-button 
        type="primary" 
        size="large" 
        :loading="loading"
        @click="handleOAuthLogin"
        class="oauth-btn"
      >
        <img src="@/assets/logo.png" alt="" class="logo-icon" />
        使用 Beaver 账号登录
      </el-button>
      
      <div class="login-tip">
        登录后即可管理您的应用和 API
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import config from '@/config/env'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const loading = ref(false)

    const handleOAuthLogin = () => {
      loading.value = true

      const authUrl = new URL(`${config.oauthBaseUrl}/auth`)
      authUrl.searchParams.set('appId', config.openAppId)
      authUrl.searchParams.set('redirectUri', config.oauthRedirectUri)
      authUrl.searchParams.set('scope', 'user_info')

      window.location.href = authUrl.toString()
    }

    return {
      loading,
      handleOAuthLogin
    }
  }
})
</script>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 48px 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.login-header {
  margin-bottom: 40px;
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.oauth-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  
  .logo-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
}

.login-tip {
  margin-top: 24px;
  font-size: 13px;
  color: #999;
}
</style>
