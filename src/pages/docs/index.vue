<template>
  <div class="docs-page">
    <!-- 侧边栏导航 -->
    <el-container>
      <el-aside width="280px" class="docs-sidebar">
        <el-menu
          :default-active="activeMenu"
          @select="handleMenuSelect"
        >
          <el-sub-menu index="auth">
            <template #title>
              <el-icon><Key /></el-icon>
              <span>认证接口</span>
            </template>
            <el-menu-item index="auth-token">获取 access_token</el-menu-item>
            <el-menu-item index="auth-refresh">刷新 access_token</el-menu-item>
            <el-menu-item index="auth-h5">H5 免登</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="message">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>消息接口</span>
            </template>
            <el-menu-item index="message-send">发送消息</el-menu-item>
            <el-menu-item index="message-revoke">撤回消息</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="bot">
            <template #title>
              <el-icon><Connection /></el-icon>
              <span>Bot 接口</span>
            </template>
            <el-menu-item index="bot-send">Bot 发送消息</el-menu-item>
            <el-menu-item index="bot-stream">Bot 流式消息</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="group">
            <template #title>
              <el-icon><UserFilled /></el-icon>
              <span>群组接口</span>
            </template>
            <el-menu-item index="group-create">创建群组</el-menu-item>
            <el-menu-item index="group-add-member">添加群成员</el-menu-item>
            <el-menu-item index="group-info">获取群组信息</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="contact">
            <template #title>
              <el-icon><Avatar /></el-icon>
              <span>联系人接口</span>
            </template>
            <el-menu-item index="contact-user-detail">获取用户详情</el-menu-item>
            <el-menu-item index="contact-batch-users">批量获取用户</el-menu-item>
            <el-menu-item index="contact-search">搜索用户</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="webhook">
            <template #title>
              <el-icon><Bell /></el-icon>
              <span>Webhook 接口</span>
            </template>
            <el-menu-item index="webhook-generate">生成 Webhook URL</el-menu-item>
            <el-menu-item index="webhook-send">Webhook 发送消息</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="event">
            <template #title>
              <el-icon><Bell /></el-icon>
              <span>事件订阅</span>
            </template>
            <el-menu-item index="event-subscribe">配置事件订阅</el-menu-item>
            <el-menu-item index="event-logs">事件推送日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 文档内容区 -->
      <el-main class="docs-content">
        <!-- 认证接口 -->
        <div v-if="activeMenu === 'auth-token'" class="api-doc">
          <h2>获取 access_token</h2>
          <p class="api-desc">使用 AppID 和 AppSecret 换取访问令牌,用于后续 API 调用</p>
          
          <el-card class="api-card">
            <template #header>
              <div class="card-header">
                <span class="method post">POST</span>
                <code>/api/open/v1/auth/token</code>
              </div>
            </template>
            
            <h4>请求参数</h4>
            <el-table :data="authTokenParams" border stripe>
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h4>请求示例</h4>
            <pre><code>{{ authTokenExample }}</code></pre>

            <h4>响应示例</h4>
            <pre><code>{{ authTokenResponse }}</code></pre>
          </el-card>
        </div>

        <!-- 消息发送 -->
        <div v-if="activeMenu === 'message-send'" class="api-doc">
          <h2>发送消息</h2>
          <p class="api-desc">向指定用户或群组发送消息,支持文本、图片、文件等多种类型</p>
          
          <el-card class="api-card">
            <template #header>
              <div class="card-header">
                <span class="method post">POST</span>
                <code>/api/open/v1/message/send</code>
              </div>
            </template>

            <el-alert title="需要 access_token 认证" type="warning" :closable="false" style="margin-bottom: 20px" />
            
            <h4>请求头</h4>
            <el-table :data="messageSendHeaders" border stripe>
              <el-table-column prop="name" label="参数名" width="200" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag type="danger" size="small">是</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h4>请求参数</h4>
            <el-table :data="messageSendParams" border stripe>
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h4>请求示例</h4>
            <pre><code>{{ messageSendExample }}</code></pre>

            <h4>响应示例</h4>
            <pre><code>{{ messageSendResponse }}</code></pre>
          </el-card>
        </div>

        <!-- 默认显示概览 -->
        <div v-if="activeMenu === ''" class="api-overview">
          <h2>API 概览</h2>
          <p>Beaver 开放平台提供丰富的 API 接口,帮助开发者快速集成 IM 能力</p>
          
          <el-row :gutter="20" style="margin-top: 30px">
            <el-col :span="8">
              <el-card shadow="hover">
                <h3>🔐 认证接口</h3>
                <p>获取和刷新 access_token</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <h3>💬 消息接口</h3>
                <p>发送和撤回消息</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <h3>🤖 Bot 接口</h3>
                <p>机器人消息推送</p>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- H5 免登 -->
        <div v-if="activeMenu === 'auth-h5'" class="api-doc">
          <h2>H5 免登</h2>
          <p class="api-desc">在海狸IM客户端 WebView 中打开第三方应用时,自动获取当前用户身份,无需手动登录</p>
          
          <el-alert title="使用场景" type="info" :closable="false" style="margin-bottom: 20px">
            <p>用户在<strong>海狸IM PC 客户端</strong>内打开第三方 H5 应用时,通过 JSBridge 调用获取临时授权码,后端用授权码换取用户信息,实现无缝登录。</p>
          </el-alert>

          <el-card class="api-card">
            <template #header>
              <div class="card-header">
                <span class="method post">POST</span>
                <code>/api/open/v1/oauth/h5/authcode</code>
              </div>
            </template>
            
            <h4>请求参数</h4>
            <el-table :data="h5AuthCodeParams" border stripe>
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h4>请求示例</h4>
            <pre><code>{{ h5AuthCodeExample }}</code></pre>

            <h4>响应示例</h4>
            <pre><code>{{ h5AuthCodeResponse }}</code></pre>
          </el-card>

          <el-card class="api-card">
            <template #header>
              <div class="card-header">
                <span class="method post">POST</span>
                <code>/api/open/v1/oauth/h5/userinfo</code>
              </div>
            </template>
            
            <h4>用 authCode 换取用户信息</h4>
            <el-table :data="h5UserInfoParams" border stripe>
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h4>前端完整流程示例</h4>
            <pre><code>{{ h5FullExample }}</code></pre>
          </el-card>
        </div>

        <!-- 事件订阅 -->
        <div v-if="activeMenu === 'event-subscribe'" class="api-doc">
          <h2>配置事件订阅</h2>
          <p class="api-desc">订阅用户行为事件(如加入群组、发送消息),实时接收推送到你的服务器</p>
          
          <el-alert title="支持的事件类型" type="info" :closable="false" style="margin-bottom: 20px">
            <ul style="margin: 10px 0; padding-left: 20px">
              <li><code>user.join_group</code> - 用户加入群组</li>
              <li><code>user.leave_group</code> - 用户离开群组</li>
              <li><code>message.send</code> - 发送消息</li>
              <li><code>group.create</code> - 创建群组</li>
            </ul>
          </el-alert>

          <el-card class="api-card">
            <template #header>
              <div class="card-header">
                <span class="method post">POST</span>
                <code>/api/open/v1/event/subscribe</code>
              </div>
            </template>
            
            <h4>请求参数</h4>
            <el-table :data="eventSubscribeParams" border stripe>
              <el-table-column prop="name" label="参数名" width="150" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="required" label="必填" width="80">
                <template #default="{ row }">
                  <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                    {{ row.required ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="说明" />
            </el-table>

            <h4>请求示例</h4>
            <pre><code>{{ eventSubscribeExample }}</code></pre>

            <h4>响应示例</h4>
            <pre><code>{{ eventSubscribeResponse }}</code></pre>

            <h4>事件推送格式</h4>
            <pre><code>{{ eventPushFormat }}</code></pre>

            <h4>签名验证</h4>
            <p>如果配置了 <code>secret</code>,我们会在请求头中添加签名:</p>
            <ul style="margin: 10px 0; padding-left: 20px">
              <li><code>X-Beaver-Signature</code> - HMAC-SHA256 签名</li>
              <li><code>X-Beaver-Timestamp</code> - 时间戳</li>
            </ul>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Key, ChatDotRound, Connection, UserFilled, Avatar, Bell } from '@element-plus/icons-vue'

const activeMenu = ref('')

const handleMenuSelect = (index: string) => {
  activeMenu.value = index
}

// 认证接口数据
const authTokenParams = [
  { name: 'app_id', type: 'string', required: true, desc: '应用 ID' },
  { name: 'app_secret', type: 'string', required: true, desc: '应用密钥' }
]

const authTokenExample = `curl -X POST https://api.beaver.im/api/open/v1/auth/token \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_id": "your_app_id",
    "app_secret": "your_app_secret"
  }'`

const authTokenResponse = `{
  "code": 0,
  "msg": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 7200,
    "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..."
  }
}`

// 消息发送数据
const messageSendHeaders = [
  { name: 'Authorization', desc: 'Bearer {access_token}' }
]

const messageSendParams = [
  { name: 'target_id', type: 'string', required: true, desc: '目标用户 ID 或群组 ID' },
  { name: 'content', type: 'string', required: true, desc: '消息内容' },
  { name: 'msg_type', type: 'string', required: true, desc: '消息类型: text/image/file' },
  { name: 'chat_type', type: 'string', required: false, desc: '聊天类型: single/group,默认 single' }
]

const messageSendExample = `curl -X POST https://api.beaver.im/api/open/v1/message/send \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_id": "user_123",
    "content": "Hello, Beaver!",
    "msg_type": "text",
    "chat_type": "single"
  }'`

const messageSendResponse = `{
  "code": 0,
  "msg": "success",
  "data": {
    "message_id": "msg_abc123",
    "created_at": 1234567890
  }
}`

// H5 免登数据
const h5AuthCodeParams = [
  { name: 'appId', type: 'string', required: true, desc: '应用 ID' }
]

const h5AuthCodeExample = `// 在海狸IM客户端 WebView 中调用
BeaverSDK.getAuthCode({
  appId: 'your_app_id',
  onSuccess: (res) => {
    console.log('authCode:', res.authCode)
    // 将 authCode 传给后端换取用户信息
  }
})`

const h5AuthCodeResponse = `{
  "code": 0,
  "msg": "success",
  "data": {
    "authCode": "h5_auth_xxxxxx",
    "expireIn": 300
  }
}`

const h5UserInfoParams = [
  { name: 'appId', type: 'string', required: true, desc: '应用 ID' },
  { name: 'appSecret', type: 'string', required: true, desc: '应用密钥' },
  { name: 'authCode', type: 'string', required: true, desc: '临时授权码' }
]

const h5FullExample = `// 前端获取 authCode
BeaverSDK.getAuthCode({
  appId: 'your_app_id',
  onSuccess: async (res) => {
    // 传给后端换取用户信息
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appId: 'your_app_id',
        appSecret: 'your_app_secret',
        authCode: res.authCode
      })
    })
    
    const userInfo = await response.json()
    console.log('用户信息:', userInfo)
    // 完成登录
  }
})

// 后端用 authCode 换取用户信息
curl -X POST https://api.beaver.im/api/open/v1/oauth/h5/userinfo \\
  -H "Content-Type: application/json" \\
  -d '{
    "appId": "your_app_id",
    "appSecret": "your_app_secret",
    "authCode": "h5_auth_xxxxxx"
  }'`

// 事件订阅数据
const eventSubscribeParams = [
  { name: 'appId', type: 'string', required: true, desc: '应用 ID' },
  { name: 'eventType', type: 'string', required: true, desc: '事件类型' },
  { name: 'targetUrl', type: 'string', required: true, desc: '推送目标 URL' },
  { name: 'secret', type: 'string', required: false, desc: '签名密钥(用于验证请求来源)' },
  { name: 'retryCount', type: 'int', required: false, desc: '重试次数,默认 3' },
  { name: 'timeout', type: 'int', required: false, desc: '超时时间(秒),默认 5' }
]

const eventSubscribeExample = `curl -X POST https://api.beaver.im/api/open/v1/event/subscribe \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "appId": "your_app_id",
    "eventType": "user.join_group",
    "targetUrl": "https://your-server.com/webhook",
    "secret": "your_secret_key",
    "retryCount": 3,
    "timeout": 5
  }'`

const eventSubscribeResponse = `{
  "code": 0,
  "msg": "success",
  "data": {
    "subscriptionId": 123
  }
}`

const eventPushFormat = `{
  "eventId": "evt_1234567890",
  "eventType": "user.join_group",
  "timestamp": 1234567890,
  "data": {
    "userId": "user_123",
    "groupId": "group_456",
    "groupName": "测试群组"
  }
}`
</script>

<style scoped lang="less">
.docs-page {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;

  .docs-sidebar {
    background: white;
    border-right: 1px solid #e4e7ed;
    height: calc(100vh - 60px);
    overflow-y: auto;

    .el-menu {
      border-right: none;
    }
  }

  .docs-content {
    padding: 30px;

    .api-doc {
      max-width: 1000px;

      h2 {
        font-size: 28px;
        color: #303133;
        margin-bottom: 10px;
      }

      .api-desc {
        color: #606266;
        font-size: 16px;
        margin-bottom: 30px;
      }

      .api-card {
        margin-bottom: 30px;

        .card-header {
          display: flex;
          align-items: center;
          gap: 15px;

          .method {
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;

            &.post {
              background: #67c23a;
              color: white;
            }

            &.get {
              background: #409eff;
              color: white;
            }
          }

          code {
            font-family: 'Courier New', monospace;
            font-size: 16px;
            color: #303133;
          }
        }

        h4 {
          margin: 25px 0 15px;
          color: #303133;
          font-size: 18px;
        }

        pre {
          background: #282c34;
          color: #abb2bf;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin-top: 15px;

          code {
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
          }
        }
      }
    }

    .api-overview {
      max-width: 1000px;

      h2 {
        font-size: 28px;
        color: #303133;
        margin-bottom: 10px;
      }

      p {
        color: #606266;
        font-size: 16px;
      }

      .el-card {
        text-align: center;
        padding: 20px;
        transition: transform 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        h3 {
          font-size: 20px;
          margin-bottom: 10px;
        }

        p {
          color: #909399;
        }
      }
    }
  }
}
</style>
