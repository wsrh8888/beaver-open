<template>
  <div class="oauth-panel">
    <el-card shadow="never">
      <el-form label-width="120px" class="config-form">
        <el-form-item label="回调地址">
          <div v-for="(uri, index) in localConfig.redirectUris" :key="index" class="redirect-uri-item">
            <el-input 
              v-model="localConfig.redirectUris[index]" 
              placeholder="https://your-site.com/callback"
            >
              <template #append>
                <el-button @click="removeRedirectUri(index)" type="danger" text>
                  <img src="@/assets/icons/delete.svg" alt="" class="btn-icon" />
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button text type="primary" @click="addRedirectUri" style="margin-top: 8px">
            <img src="@/assets/icons/plus.svg" alt="" class="btn-icon" />
            添加回调地址
          </el-button>
          <div class="form-tip">用户授权后跳转的地址,可以配置多个</div>
        </el-form-item>

        <el-form-item label="自定义 Logo">
          <el-input 
            v-model="localConfig.customLogo" 
            placeholder="授权页面显示的 Logo URL"
          />
        </el-form-item>

        <el-form-item label="自定义标题">
          <el-input 
            v-model="localConfig.customTitle" 
            placeholder="授权页面显示的标题文字"
          />
        </el-form-item>

        <el-form-item label="主题颜色">
          <el-color-picker v-model="localConfig.customColor" />
          <span class="color-value">{{ localConfig.customColor }}</span>
        </el-form-item>

        <el-form-item label="Token 有效期">
          <el-input-number 
            v-model="localConfig.tokenExpiration" 
            :min="3600" 
            :max="86400"
            :step="3600"
          />
          <span class="unit-text">秒</span>
          <div class="form-tip">Access Token 的有效时长,范围 1-24 小时</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="code-example-card">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/code.svg" alt="" class="icon" />
          <span>集成示例代码</span>
        </div>
      </template>

      <el-tabs type="border-card">
        <el-tab-pane label="JavaScript">
          <pre class="code-block"><code>{{ jsCodeExample }}</code></pre>
        </el-tab-pane>
        <el-tab-pane label="Python">
          <pre class="code-block"><code>{{ pythonCodeExample }}</code></pre>
        </el-tab-pane>
        <el-tab-pane label="Go">
          <pre class="code-block"><code>{{ goCodeExample }}</code></pre>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOAuthConfigApi, updateOAuthConfigApi } from '@/api/oauth'

interface IOAuthConfig {
  redirectUris: string[]
  customLogo: string
  customTitle: string
  customColor: string
  tokenExpiration: number
}

export default defineComponent({
  name: 'OAuthPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const localConfig = reactive<IOAuthConfig>({
      redirectUris: [],
      customLogo: '',
      customTitle: '',
      customColor: '#FF7D45',
      tokenExpiration: 7200
    })
    const saving = ref(false)
    const loading = ref(false)

    // 加载 OAuth 配置
    const loadOAuthConfig = async () => {
      loading.value = true
      const res = await getOAuthConfigApi({ appId: props.appId })
      if (res.code === 0 && res.result?.config) {
        Object.assign(localConfig, {
          redirectUris: res.result.config.redirectUris || [],
          customLogo: res.result.config.customLogo || '',
          customTitle: res.result.config.customTitle || '',
          customColor: res.result.config.customColor || '#FF7D45',
          tokenExpiration: res.result.config.tokenExpiration || 7200
        })
      }
      loading.value = false
    }

    const addRedirectUri = () => {
      localConfig.redirectUris.push('')
    }

    const removeRedirectUri = (index: number) => {
      localConfig.redirectUris.splice(index, 1)
    }

    const handleSave = async () => {
      if (localConfig.redirectUris.length === 0) {
        ElMessage.warning('请至少添加一个回调地址')
        return
      }
      
      for (const uri of localConfig.redirectUris) {
        if (!uri || !uri.startsWith('http')) {
          ElMessage.warning('请输入有效的回调地址')
          return
        }
      }
      
      saving.value = true
      const res = await updateOAuthConfigApi({
        appId: props.appId,
        redirectUris: localConfig.redirectUris,
        customLogo: localConfig.customLogo,
        customTitle: localConfig.customTitle,
        customColor: localConfig.customColor,
        tokenExpiration: localConfig.tokenExpiration
      })
      if (res.code === 0) {
        ElMessage.success('OAuth 配置保存成功')
        await loadOAuthConfig()
      }
      saving.value = false
    }

    onMounted(() => {
      loadOAuthConfig()
    })

    const jsCodeExample = `// 1. 引导用户跳转到授权页面
const authUrl = \`https://beaver.com/oauth/authorize?
  client_id=\${appId}&
  redirect_uri=\${encodeURIComponent(redirectUri)}&
  response_type=code&
  scope=openid,user_profile\`

window.location.href = authUrl

// 2. 在回调地址接收 code
const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')

// 3. 用 code 换取 access_token
const response = await fetch('https://beaver.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code: code,
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri
  })
})

const { access_token } = await response.json()

// 4. 用 token 获取用户信息
const userInfo = await fetch('https://beaver.com/oauth/userinfo', {
  headers: { 'Authorization': \`Bearer \${access_token}\` }
}).then(res => res.json())

console.log('用户信息:', userInfo)`

    const pythonCodeExample = `import requests

# 1. 构建授权 URL
auth_url = (
    "https://beaver.com/oauth/authorize?"
    f"client_id={app_id}&"
    f"redirect_uri={redirect_uri}&"
    "response_type=code&"
    "scope=openid,user_profile"
)

# 2. 用户授权后,从回调获取 code
# code = request.args.get('code')

# 3. 用 code 换取 access_token
response = requests.post(
    "https://beaver.com/oauth/token",
    json={
        "grant_type": "authorization_code",
        "code": code,
        "client_id": app_id,
        "client_secret": app_secret,
        "redirect_uri": redirect_uri
    }
)
access_token = response.json()["access_token"]

# 4. 获取用户信息
user_info = requests.get(
    "https://beaver.com/oauth/userinfo",
    headers={"Authorization": f"Bearer {access_token}"}
).json()

print("用户信息:", user_info)`

    const goCodeExample = `package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

// 1. 构建授权 URL
authURL := fmt.Sprintf(
    "https://beaver.com/oauth/authorize?client_id=%s&redirect_uri=%s&response_type=code&scope=openid,user_profile",
    appID, redirectURI,
)

// 2. 用户授权后,从回调获取 code
// code := r.URL.Query().Get("code")

// 3. 用 code 换取 access_token
resp, _ := http.Post(
    "https://beaver.com/oauth/token",
    "application/json",
    strings.NewReader(fmt.Sprintf(\`{
        "grant_type": "authorization_code",
        "code": "%s",
        "client_id": "%s",
        "client_secret": "%s",
        "redirect_uri": "%s"
    }\`, code, appID, appSecret, redirectURI)),
)

var tokenResp struct {
    AccessToken string \`json:"access_token"\`
}
json.NewDecoder(resp.Body).Decode(&tokenResp)

// 4. 获取用户信息
req, _ := http.NewRequest("GET", "https://beaver.com/oauth/userinfo", nil)
req.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)

userResp, _ := http.DefaultClient.Do(req)
var userInfo map[string]interface{}
json.NewDecoder(userResp.Body).Decode(&userInfo)

fmt.Println("用户信息:", userInfo)`

    return {
      localConfig,
      saving,
      loading,
      addRedirectUri,
      removeRedirectUri,
      handleSave,
      jsCodeExample,
      pythonCodeExample,
      goCodeExample
    }
  }
})
</script>

<style scoped lang="less">
.oauth-panel {
  max-height: calc(100vh - 280px);
  overflow-y: auto;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .config-form {
    .form-tip {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 4px;
      line-height: 1.5;
    }

    .redirect-uri-item {
      margin-bottom: var(--spacing-sm);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .color-value {
      margin-left: var(--spacing-sm);
      font-size: 13px;
      color: var(--text-secondary);
    }

    .unit-text {
      margin-left: var(--spacing-sm);
      font-size: 13px;
      color: var(--text-secondary);
    }

    .btn-icon {
      width: 16px;
      height: 16px;
    }
  }

  .code-example-card {
    margin-top: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);

      .icon {
        width: 20px;
        height: 20px;
        color: var(--primary);
      }
    }

    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: var(--spacing-md);
      border-radius: var(--radius-sm);
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }
  }
}
</style>
