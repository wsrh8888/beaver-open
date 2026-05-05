<template>
  <div class="app-detail">
    <el-page-header @back="$router.back()" title="返回">
      <template #content>
        <span class="page-title">应用详情</span>
      </template>
    </el-page-header>

    <el-card style="margin-top: 20px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="AppID">
          {{ appInfo?.appId }}
          <el-button link type="primary" @click="copyToClipboard(appInfo?.appId)">
            复制
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="AppSecret">
          {{ maskSecret(appInfo?.appSecret || '') }}
          <el-button link type="primary" @click="showSecret = !showSecret">
            {{ showSecret ? '隐藏' : '显示' }}
          </el-button>
          <el-button link type="danger" @click="handleResetSecret">
            重置密钥
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="应用名称">
          {{ appInfo?.name }}
        </el-descriptions-item>
        <el-descriptions-item label="描述">
          {{ appInfo?.description || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="appInfo?.status === 1 ? 'success' : 'info'">
            {{ appInfo?.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ appInfo?.createdAt ? formatTime(appInfo.createdAt) : '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-tabs v-model="activeTab" style="margin-top: 20px" @tab-click="handleTabChange">
      <el-tab-pane label="基本信息" name="basic">
        <el-alert
          title="请妥善保管 AppSecret，泄露可能导致安全问题"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span>密钥管理</span>
          </template>
          <p style="color: #909399; margin-bottom: 15px">
            重置密钥后，旧密钥将立即失效，请使用新密钥重新配置您的应用。
          </p>
          <el-button type="danger" @click="handleResetSecret">
            重置 AppSecret
          </el-button>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="权限管理" name="permissions">
        <el-alert
          title="权限管理"
          description="配置应用的 API 访问权限，遵循最小权限原则"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>API 权限列表</span>
              <el-button type="primary" size="small" @click="handleSavePermissions">
                保存权限
              </el-button>
            </div>
          </template>
          
          <el-empty v-if="!scopes || scopes.length === 0" description="暂无权限数据" />
          
          <el-checkbox-group v-else v-model="selectedScopes" style="display: flex; flex-direction: column; gap: 12px">
            <el-checkbox
              v-for="scope in scopes"
              :key="scope.scope"
              :value="scope.scope"
              :disabled="scope.required"
              style="padding: 12px; border: 1px solid #dcdfe6; border-radius: 4px"
            >
              <div style="display: flex; flex-direction: column; gap: 4px">
                <div style="display: flex; align-items: center; gap: 8px">
                  <strong>{{ scope.name }}</strong>
                  <el-tag v-if="scope.required" size="small" type="warning">必需</el-tag>
                  <el-tag v-if="scope.enabled" size="small" type="success">已启用</el-tag>
                </div>
                <div style="color: #909399; font-size: 12px">
                  {{ scope.description }}
                </div>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="Bot 配置" name="bot">
        <el-alert
          title="Bot 机器人配置"
          description="配置应用的 Bot 能力，让应用可以作为机器人在群聊和私聊中收发消息"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>Bot 基本信息</span>
              <el-button type="primary" size="small" @click="handleSaveBotConfig">
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form label-width="120px">
            <el-form-item label="Bot UserID">
              <el-input v-model="botConfig.botUserId" disabled>
                <template #append>
                  <el-button @click="copyToClipboard(botConfig.botUserId)">复制</el-button>
                </template>
              </el-input>
              <div style="color: #909399; font-size: 12px; margin-top: 4px">
                Bot 的唯一标识，创建应用时自动生成
              </div>
            </el-form-item>
            
            <el-form-item label="Bot 名称">
              <el-input v-model="botConfig.botName" placeholder="请输入 Bot 名称" />
            </el-form-item>
            
            <el-form-item label="Bot 头像">
              <el-input v-model="botConfig.botAvatar" placeholder="请输入头像 URL" />
            </el-form-item>
            
            <el-form-item label="Bot 简介">
              <el-input
                v-model="botConfig.botDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入 Bot 简介"
              />
            </el-form-item>
            
            <el-form-item label="能力开关">
              <el-checkbox v-model="botConfig.enableSingleChat">允许单聊</el-checkbox>
              <el-checkbox v-model="botConfig.enableGroupChat" style="margin-left: 20px">允许群聊</el-checkbox>
              <el-checkbox v-model="botConfig.enableAtMention" style="margin-left: 20px">允许 @ 提及</el-checkbox>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span>如何添加 Bot</span>
          </template>
          
          <el-steps :active="2" align-center>
            <el-step title="复制 Bot UserID" description="点击上方的复制按钮" />
            <el-step title="搜索添加" description="在 IM 中搜索 Bot UserID" />
            <el-step title="开始对话" description="添加成功后即可开始对话" />
          </el-steps>
          
          <el-divider />
          
          <div style="color: #606266; line-height: 1.8">
            <p><strong>添加到群聊：</strong></p>
            <ol style="margin-left: 20px">
              <li>打开群聊设置</li>
              <li>点击“添加成员”</li>
              <li>搜索 Bot UserID 或 Bot 名称</li>
              <li>确认添加即可</li>
            </ol>
            
            <p style="margin-top: 15px"><strong>添加为好友：</strong></p>
            <ol style="margin-left: 20px">
              <li>点击“添加好友”</li>
              <li>搜索 Bot UserID</li>
              <li>发送好友申请</li>
              <li>等待通过后即可私聊</li>
            </ol>
          </div>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="OAuth 配置" name="oauth">
        <el-alert
          title="OAuth 快捷登录配置"
          description="配置后，其他网站可以使用“使用 Beaver 登录”功能，类似微信登录、GitHub 登录"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-card shadow="never">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>OAuth 配置</span>
              <el-button type="primary" size="small" @click="handleSaveOAuthConfig">
                保存配置
              </el-button>
            </div>
          </template>
          
          <el-form label-width="120px">
            <el-form-item label="回调地址">
              <div v-for="(uri, index) in oauthConfig.redirectUris" :key="index" style="margin-bottom: 10px">
                <el-input v-model="oauthConfig.redirectUris[index]" placeholder="https://your-site.com/callback">
                  <template #append>
                    <el-button @click="removeRedirectUri(index)" type="danger">删除</el-button>
                  </template>
                </el-input>
              </div>
              <el-button size="small" @click="addRedirectUri">+ 添加回调地址</el-button>
              <div style="color: #909399; font-size: 12px; margin-top: 4px">
                用户授权后跳转的地址，可以配置多个
              </div>
            </el-form-item>
            
            <el-form-item label="自定义 Logo">
              <el-input v-model="oauthConfig.customLogo" placeholder="授权页面显示的 Logo URL" />
            </el-form-item>
            
            <el-form-item label="自定义标题">
              <el-input v-model="oauthConfig.customTitle" placeholder="授权页面显示的标题" />
            </el-form-item>
            
            <el-form-item label="主题颜色">
              <el-color-picker v-model="oauthConfig.customColor" />
            </el-form-item>
            
            <el-form-item label="Token 有效期">
              <el-input-number v-model="oauthConfig.tokenExpiration" :min="3600" :max="86400" />
              <span style="margin-left: 10px; color: #909399">秒</span>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span>集成示例</span>
          </template>
          
          <el-tabs type="border-card">
            <el-tab-pane label="JavaScript">
              <pre style="background: #f5f7fa; padding: 15px; border-radius: 4px; overflow-x: auto"><code>// 1. 引导用户跳转到授权页面
const authUrl = `https://beaver.com/oauth/authorize?
  client_id=${appId}&
  redirect_uri=${encodeURIComponent(redirectUri)}&
  response_type=code&
  scope=openid,user_profile`

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
  headers: { 'Authorization': `Bearer ${access_token}` }
}).then(res => res.json())

console.log('用户信息:', userInfo)</code></pre>
            </el-tab-pane>
            <el-tab-pane label="Python">
              <pre style="background: #f5f7fa; padding: 15px; border-radius: 4px; overflow-x: auto"><code>import requests

# 1. 构建授权 URL
auth_url = (
    "https://beaver.com/oauth/authorize?"
    f"client_id={app_id}&"
    f"redirect_uri={redirect_uri}&"
    "response_type=code&"
    "scope=openid,user_profile"
)

# 2. 用户授权后，从回调获取 code
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

print("用户信息:", user_info)</code></pre>
            </el-tab-pane>
            <el-tab-pane label="Go">
              <pre style="background: #f5f7fa; padding: 15px; border-radius: 4px; overflow-x: auto"><code>package main

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

// 2. 用户授权后，从回调获取 code
// code := r.URL.Query().Get("code")

// 3. 用 code 换取 access_token
resp, _ := http.Post(
    "https://beaver.com/oauth/token",
    "application/json",
    strings.NewReader(fmt.Sprintf(`{
        "grant_type": "authorization_code",
        "code": "%s",
        "client_id": "%s",
        "client_secret": "%s",
        "redirect_uri": "%s"
    }`, code, appID, appSecret, redirectURI)),
)

var tokenResp struct {
    AccessToken string `json:"access_token"`
}
json.NewDecoder(resp.Body).Decode(&tokenResp)

// 4. 获取用户信息
req, _ := http.NewRequest("GET", "https://beaver.com/oauth/userinfo", nil)
req.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)

userResp, _ := http.DefaultClient.Do(req)
var userInfo map[string]interface{}
json.NewDecoder(userResp.Body).Decode(&userInfo)

fmt.Println("用户信息:", userInfo)</code></pre>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="Webhook 配置" name="webhook">
        <el-alert
          title="Webhook 配置"
          description="配置事件推送地址，接收消息、好友申请等事件通知"
          type="info"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-card shadow="never">
          <template #header>
            <span>事件推送配置</span>
          </template>
          
          <el-form label-width="120px">
            <el-form-item label="请求URL">
              <el-input v-model="webhookConfig.url" placeholder="https://your-domain.com/webhook" />
              <div style="color: #909399; font-size: 12px; margin-top: 4px">
                您的服务器接收事件推送的地址，需支持 POST 请求
              </div>
            </el-form-item>
            
            <el-form-item label="Token">
              <el-input v-model="webhookConfig.token" placeholder="用于验证请求来源的 Token" />
              <div style="color: #909399; font-size: 12px; margin-top: 4px">
                用于签名验证，确保请求来自 Beaver
              </div>
            </el-form-item>
            
            <el-form-item label="加密密钥">
              <el-input v-model="webhookConfig.encryptKey" placeholder="可选，用于加密消息内容" />
              <div style="color: #909399; font-size: 12px; margin-top: 4px">
                如果启用加密，消息内容将使用 AES 加密
              </div>
            </el-form-item>
            
            <el-form-item label="订阅事件">
              <el-checkbox-group v-model="webhookConfig.events">
                <el-checkbox value="message">消息事件</el-checkbox>
                <el-checkbox value="friend">好友申请事件</el-checkbox>
                <el-checkbox value="group">群组事件</el-checkbox>
                <el-checkbox value="member">成员变更事件</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSaveWebhook">保存配置</el-button>
              <el-button @click="handleTestWebhook">测试连接</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card shadow="never" style="margin-top: 20px">
          <template #header>
            <span>最近推送记录</span>
          </template>
          
          <el-empty v-if="!webhookLogs || webhookLogs.length === 0" description="暂无推送记录" />
          
          <el-table v-else :data="webhookLogs.slice(0, 5)" border>
            <el-table-column prop="eventType" label="事件类型" width="120" />
            <el-table-column prop="responseCode" label="响应码" width="100">
              <template #default="{ row }">
                <el-tag :type="row.responseCode === 200 ? 'success' : 'danger'">
                  {{ row.responseCode }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                  {{ row.status === 1 ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.createdAt) }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
      <el-tab-pane label="调用统计" name="stats">
        <el-empty description="统计功能开发中" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TabsPaneContext } from 'element-plus'
import {
  getAppDetailApi,
  resetAppSecretApi,
  getAppScopesApi,
  updateAppScopesApi,
  type IAppInfo,
  type IScopeInfo
} from '@/api/open'

export default defineComponent({
  name: 'AppDetail',
  setup() {
    const route = useRoute()
    const appId = route.params.appId as string

    const appInfo = ref<IAppInfo & { appSecret?: string } | null>(null)
    const activeTab = ref('basic')
    const showSecret = ref(false)
    
    // 权限管理相关
    const scopes = ref<IScopeInfo[]>([])
    const selectedScopes = ref<string[]>([])
    const loadingPermissions = ref(false)
    
    // Bot 配置相关
    interface IBotConfig {
      botUserId: string
      botName: string
      botAvatar: string
      botDescription: string
      enableSingleChat: boolean
      enableGroupChat: boolean
      enableAtMention: boolean
    }
    
    const botConfig = ref<IBotConfig>({
      botUserId: '',
      botName: '',
      botAvatar: '',
      botDescription: '',
      enableSingleChat: true,
      enableGroupChat: true,
      enableAtMention: true
    })
    
    // OAuth 配置相关
    interface IOAuthConfig {
      redirectUris: string[]
      customLogo: string
      customTitle: string
      customColor: string
      tokenExpiration: number
    }
    
    const oauthConfig = ref<IOAuthConfig>({
      redirectUris: [],
      customLogo: '',
      customTitle: '',
      customColor: '#409EFF',
      tokenExpiration: 7200
    })
    
    // Webhook 配置相关
    interface IWebhookConfig {
      url: string
      token: string
      encryptKey: string
      events: string[]
    }
    
    const webhookConfig = ref<IWebhookConfig>({
      url: '',
      token: '',
      encryptKey: '',
      events: []
    })
    
    interface IWebhookLog {
      id: string
      eventType: string
      responseCode: number
      status: number
      createdAt: number
    }
    
    const webhookLogs = ref<IWebhookLog[]>([])

    const formatTime = (timestamp: number) => {
      if (!timestamp) return '-'
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN')
    }

    const maskSecret = (secret: string) => {
      if (!secret || !showSecret.value) return '********************************'
      return secret
    }

    const copyToClipboard = async (text?: string) => {
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('复制成功')
      } catch (err) {
        ElMessage.error('复制失败')
      }
    }

    const handleResetSecret = async () => {
      try {
        await ElMessageBox.confirm(
          '重置密钥后，旧密钥将立即失效，确定要重置吗？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const res = await resetAppSecretApi({ appId })
        if (res.result && res.result.appSecret) {
          // 更新本地数据
          if (appInfo.value) {
            appInfo.value.appSecret = res.result.appSecret
          }
          showSecret.value = true
          
          // 显示新密钥
          await ElMessageBox.alert(
            `新密钥：${res.result.appSecret}\n\n请妥善保存，关闭后将无法再次查看！`,
            '密钥重置成功',
            {
              confirmButtonText: '我已保存',
              type: 'success'
            }
          )
          
          ElMessage.success(res.result.message || '密钥重置成功')
        }
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('重置密钥失败:', error)
          ElMessage.error('重置密钥失败，请稍后重试')
        }
      }
    }

    // 加载权限列表
    const loadPermissions = async () => {
      loadingPermissions.value = true
      try {
        const res = await getAppScopesApi({ appId })
        scopes.value = res.result.scopes
        
        // 初始化已选中的权限
        selectedScopes.value = res.result.scopes
          .filter(s => s.enabled)
          .map(s => s.scope)
      } catch (error) {
        ElMessage.error('加载权限列表失败')
      } finally {
        loadingPermissions.value = false
      }
    }

    // 保存权限
    const handleSavePermissions = async () => {
      try {
        await ElMessageBox.confirm(
          '确认保存权限配置？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }
        )

        await updateAppScopesApi({
          appId,
          scopes: selectedScopes.value
        })

        ElMessage.success('权限保存成功')
        
        // 重新加载权限列表
        await loadPermissions()
      } catch (error: any) {
        if (error !== 'cancel') {
          console.error('保存权限失败:', error)
          ElMessage.error('保存权限失败')
        }
      }
    }

    const loadAppDetail = async () => {
      try {
        const res = await getAppDetailApi({ appId })
        appInfo.value = res.result.app
        
        // 初始化 Bot UserID（从应用详情中获取）
        if (res.result.app && 'botUserId' in res.result.app) {
          botConfig.value.botUserId = (res.result.app as any).botUserId || ''
        }
      } catch (error) {
        ElMessage.error('加载应用详情失败')
      }
    }
    
    // 保存 Bot 配置
    const handleSaveBotConfig = async () => {
      if (!botConfig.value.botName) {
        ElMessage.warning('请输入 Bot 名称')
        return
      }
      
      try {
        // TODO: 调用后端 API 保存 Bot 配置
        // await updateBotConfigApi({
        //   appId,
        //   ...botConfig.value
        // })
        
        ElMessage.success('Bot 配置保存成功（功能待实现）')
      } catch (error) {
        console.error('保存 Bot 配置失败:', error)
        ElMessage.error('保存失败')
      }
    }
    
    // 添加回调地址
    const addRedirectUri = () => {
      oauthConfig.value.redirectUris.push('')
    }
    
    // 删除回调地址
    const removeRedirectUri = (index: number) => {
      oauthConfig.value.redirectUris.splice(index, 1)
    }
    
    // 保存 OAuth 配置
    const handleSaveOAuthConfig = async () => {
      if (oauthConfig.value.redirectUris.length === 0) {
        ElMessage.warning('请至少添加一个回调地址')
        return
      }
      
      // 验证回调地址格式
      for (const uri of oauthConfig.value.redirectUris) {
        if (!uri || !uri.startsWith('http')) {
          ElMessage.warning('请输入有效的回调地址（以 http:// 或 https:// 开头）')
          return
        }
      }
      
      try {
        // TODO: 调用后端 API 保存 OAuth 配置
        // await updateOAuthConfigApi({
        //   appId,
        //   ...oauthConfig.value
        // })
        
        ElMessage.success('OAuth 配置保存成功（功能待实现）')
      } catch (error) {
        console.error('保存 OAuth 配置失败:', error)
        ElMessage.error('保存失败')
      }
    }
    
    // 保存 Webhook 配置
    const handleSaveWebhook = async () => {
      if (!webhookConfig.value.url) {
        ElMessage.warning('请输入请求URL')
        return
      }
      
      try {
        // TODO: 调用后端 API 保存 Webhook 配置
        // await configWebhookApi({
        //   appId,
        //   url: webhookConfig.value.url,
        //   token: webhookConfig.value.token,
        //   encryptKey: webhookConfig.value.encryptKey,
        //   events: webhookConfig.value.events
        // })
        
        ElMessage.success('Webhook 配置保存成功（功能待实现）')
      } catch (error) {
        console.error('保存 Webhook 配置失败:', error)
        ElMessage.error('保存失败')
      }
    }
    
    // 测试 Webhook 连接
    const handleTestWebhook = async () => {
      if (!webhookConfig.value.url) {
        ElMessage.warning('请输入请求URL')
        return
      }
      
      try {
        // TODO: 调用后端 API 测试 Webhook
        ElMessage.info('正在发送测试请求...')
        
        // 模拟测试
        setTimeout(() => {
          ElMessage.success('测试请求发送成功（功能待实现）')
        }, 1000)
      } catch (error) {
        console.error('测试 Webhook 失败:', error)
        ElMessage.error('测试失败')
      }
    }

    // 监听 Tab 切换，加载权限数据
    const handleTabChange = (pane: TabsPaneContext) => {
      if (pane.paneName === 'permissions' && scopes.value.length === 0) {
        loadPermissions()
      }
    }

    onMounted(() => {
      loadAppDetail()
    })

    return {
      appInfo,
      activeTab,
      showSecret,
      scopes,
      selectedScopes,
      loadingPermissions,
      botConfig,
      oauthConfig,
      webhookConfig,
      webhookLogs,
      formatTime,
      maskSecret,
      copyToClipboard,
      handleResetSecret,
      handleSavePermissions,
      handleSaveBotConfig,
      handleSaveOAuthConfig,
      addRedirectUri,
      removeRedirectUri,
      handleSaveWebhook,
      handleTestWebhook,
      handleTabChange,
      loadAppDetail
    }
  }
})
</script>

<style scoped lang="less">
.app-detail {
  .page-title {
    font-size: 18px;
    font-weight: bold;
  }
}
</style>
