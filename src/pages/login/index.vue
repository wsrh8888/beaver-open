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
import { useRouter } from 'vue-router'
import config from '@/config/env'

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const loading = ref(false)

    // OAuth 配置
    const OAUTH_CONFIG = {
      // OAuth 授权服务地址（beaver-oauth）
      authBaseUrl: import.meta.env.VITE_OAUTH_BASE_URL,
      // 开放平台 App ID（需要在 beaver-oauth 中注册）
      appId: import.meta.env.VITE_OPEN_APP_ID,
      // 回调地址（hash 模式下 code 会落在 origin/?code=xxx 上）
      redirectUri: window.location.origin + '/',
      // 权限范围
      scope: 'user_info'
    }

    // 处理 OAuth 登录
    const handleOAuthLogin = () => {
      loading.value = true

      // 构建授权 URL
      const authUrl = new URL(`${OAUTH_CONFIG.authBaseUrl}/auth`)
      authUrl.searchParams.set('appId', OAUTH_CONFIG.appId)
      authUrl.searchParams.set('redirectUri', OAUTH_CONFIG.redirectUri)
      authUrl.searchParams.set('scope', OAUTH_CONFIG.scope)

      // 跳转到 OAuth 授权页面
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
