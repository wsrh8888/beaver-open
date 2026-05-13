<template>
  <div class="event-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/bell.svg" alt="" class="icon" />
          <span>事件与回调配置</span>
        </div>
      </template>

      <el-alert
        title="事件订阅说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>事件订阅用于接收 IM 中的各种事件通知，如消息、好友申请、群组变化等。</p>
          <p style="margin-top: 8px"><strong>推荐方式：</strong>使用长连接（WebSocket），无需公网 IP，本地即可运行（适合 OpenClaw 等本地服务）。</p>
        </template>
      </el-alert>

      <el-form label-width="120px" class="config-form">
        <!-- 订阅方式选择 -->
        <el-form-item label="订阅方式" required>
          <el-radio-group v-model="localConfig.subscribeMode" class="subscribe-mode-group">
            <el-radio value="websocket" class="mode-option">
              <div class="option-content">
                <strong>使用长连接接收事件</strong>
                <span class="option-desc">推荐，无需公网 IP，本地即可运行</span>
              </div>
            </el-radio>
            <el-radio value="webhook" class="mode-option">
              <div class="option-content">
                <strong>使用开发者服务器回调</strong>
                <span class="option-desc">需要配置公网可访问的 URL</span>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- Webhook 模式配置 -->
        <template v-if="localConfig.subscribeMode === 'webhook'">
          <el-divider />
          
          <el-form-item label="请求 URL" required>
            <el-input 
              v-model="localConfig.url" 
              placeholder="https://your-domain.com/webhook"
            />
            <div class="form-tip">
              您的服务器需支持 HTTPS，并能被 Beaver 服务器访问。URL 需返回 200 状态码。
            </div>
          </el-form-item>

          <el-form-item label="验证 Token">
            <el-input 
              v-model="localConfig.token" 
              placeholder="用于验证请求来源"
              show-password
            />
            <div class="form-tip">用于签名验证，确保请求来自 Beaver 平台</div>
          </el-form-item>

          <el-form-item label="Encrypt Key">
            <el-input 
              v-model="localConfig.encryptKey" 
              placeholder="用于消息加密"
              show-password
            />
            <div class="form-tip">如果启用，消息内容将使用 AES-256 加密传输</div>
          </el-form-item>

          <el-form-item label="重试策略">
            <el-select v-model="localConfig.retryPolicy" style="width: 100%">
              <el-option label="立即重试" value="immediate" />
              <el-option label="指数退避" value="exponential" />
              <el-option label="固定间隔" value="fixed" />
            </el-select>
          </el-form-item>

          <el-form-item label="最大重试次数">
            <el-input-number 
              v-model="localConfig.maxRetries" 
              :min="0" 
              :max="10"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="超时时间">
            <el-input-number 
              v-model="localConfig.timeout" 
              :min="1" 
              :max="30"
              style="width: 100%"
            />
            <span style="margin-left: 8px">秒</span>
          </el-form-item>
        </template>

        <!-- 长连接模式提示 -->
        <el-alert
          v-if="localConfig.subscribeMode === 'websocket'"
          title="长连接模式已就绪"
          type="success"
          :closable="false"
          style="margin-bottom: 20px"
        >
          <template #default>
            <p>✓ 无需配置公网 URL</p>
            <p>✓ 在您的应用中调用 SDK 建立长连接即可接收事件</p>
            <p>✓ 适合本地运行的 AI 助手（如 OpenClaw）</p>
            <p style="margin-top: 8px">
              <strong>集成示例：</strong>
              <code style="background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px;">
                const ws = new WebSocket('wss://beaver.com/ws/events?app_id=YOUR_APP_ID&token=YOUR_TOKEN')
              </code>
            </p>
          </template>
        </el-alert>

        <el-divider />

        <!-- 事件类型选择 -->
        <el-form-item label="订阅事件" required>
          <div class="event-section">
            <el-checkbox-group v-model="localConfig.events" class="event-checkboxes">
              <el-checkbox value="im.message.receive_v1">
                <div class="event-label">
                  <strong>接收消息</strong>
                  <span>用户发送消息给 Bot 或在群聊中 @Bot 时触发</span>
                </div>
              </el-checkbox>
              <el-checkbox value="im.chat.member.bot.added_v1">
                <div class="event-label">
                  <strong>机器人进群</strong>
                  <span>Bot 被添加到群组时触发</span>
                </div>
              </el-checkbox>
              <el-checkbox value="im.chat.member.bot.deleted_v1">
                <div class="event-label">
                  <strong>机器人被移出群</strong>
                  <span>Bot 从群组中被移除时触发</span>
                </div>
              </el-checkbox>
              <el-checkbox value="im.message.message_read_v1">
                <div class="event-label">
                  <strong>消息已读</strong>
                  <span>用户阅读 Bot 发送的消息时触发</span>
                </div>
              </el-checkbox>
              <el-checkbox value="im.friend.request_v1">
                <div class="event-label">
                  <strong>好友申请</strong>
                  <span>收到好友申请时触发</span>
                </div>
              </el-checkbox>
              <el-checkbox value="im.group.created_v1">
                <div class="event-label">
                  <strong>群组创建</strong>
                  <span>新群组创建时触发</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
            <div class="form-tip" style="margin-top: 12px">
              至少选择一个事件类型。Bot 机器人通常需要订阅"接收消息"事件。
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
          <el-button 
            v-if="localConfig.subscribeMode === 'webhook'" 
            @click="handleTest" 
            :loading="testing"
          >
            测试连接
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 推送记录 -->
    <el-card shadow="never" v-if="logs && logs.length > 0" style="margin-top: 20px">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/list.svg" alt="" class="icon" />
          <span>最近推送记录</span>
        </div>
      </template>

      <el-table :data="logs.slice(0, 10)" border stripe>
        <el-table-column prop="eventType" label="事件类型" width="150">
          <template #default="{ row }">
            <el-tag size="small">{{ getEventTypeLabel(row.eventType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responseCode" label="响应码" width="100">
          <template #default="{ row }">
            <el-tag :type="row.responseCode === 200 ? 'success' : 'danger'" size="small">
              {{ row.responseCode }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="推送时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { configWebhookApi, getWebhookLogsApi } from '@/api/webhook'

interface IEventConfig {
  subscribeMode: 'websocket' | 'webhook'
  url: string
  token: string
  encryptKey: string
  events: string[]
  retryPolicy: 'immediate' | 'exponential' | 'fixed'
  maxRetries: number
  timeout: number
}

interface IWebhookLog {
  id: string
  eventType: string
  responseCode: number
  status: number
  createdAt: number
}

export default defineComponent({
  name: 'EventPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const localConfig = reactive<IEventConfig>({
      subscribeMode: 'websocket',
      url: '',
      token: '',
      encryptKey: '',
      events: [],
      retryPolicy: 'exponential',
      maxRetries: 3,
      timeout: 5
    })
    const logs = ref<IWebhookLog[]>([])
    const saving = ref(false)
    const testing = ref(false)
    const loading = ref(false)

    const formatTime = (timestamp: number) => {
      if (!timestamp) return '-'
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN')
    }

    const getEventTypeLabel = (eventType: string) => {
      const map: Record<string, string> = {
        'im.message.receive_v1': '接收消息',
        'im.chat.member.bot.added_v1': '机器人进群',
        'im.chat.member.bot.deleted_v1': '机器人出群',
        'im.message.message_read_v1': '消息已读',
        'im.friend.request_v1': '好友申请',
        'im.group.created_v1': '群组创建'
      }
      return map[eventType] || eventType
    }

    // 加载 Webhook 日志
    const loadWebhookLogs = async () => {
      const res = await getWebhookLogsApi({ 
        appId: props.appId,
        page: 1,
        pageSize: 10
      })
      if (res.code === 0) {
        logs.value = res.result.list || []
      }
    }

    // 保存事件订阅配置
    const handleSave = async () => {
      if (localConfig.subscribeMode === 'webhook' && !localConfig.url) {
        ElMessage.warning('请输入回调 URL')
        return
      }
      
      if (localConfig.events.length === 0) {
        ElMessage.warning('请至少选择一个事件类型')
        return
      }
      
      saving.value = true
      
      // 将事件列表转换为 JSON 字符串
      const eventsJson = JSON.stringify(localConfig.events)
      
      const res = await configWebhookApi({
        appId: props.appId,
        eventType: localConfig.events[0], // 主事件类型（兼容旧接口）
        targetUrl: localConfig.subscribeMode === 'webhook' ? localConfig.url : '',
        secret: localConfig.encryptKey,
        events: eventsJson,
        subscribeMode: localConfig.subscribeMode
      })
      
      if (res.code === 0) {
        ElMessage.success('事件订阅配置保存成功')
        await loadWebhookLogs()
      }
      saving.value = false
    }

    // 测试 Webhook
    const handleTest = async () => {
      if (!localConfig.url) {
        ElMessage.warning('请输入请求 URL')
        return
      }
      
      testing.value = true
      // TODO: 调用后端 API 测试 Webhook
      setTimeout(() => {
        ElMessage.success('测试请求发送成功')
        testing.value = false
      }, 1000)
    }

    onMounted(() => {
      loadWebhookLogs()
    })

    return {
      localConfig,
      logs,
      saving,
      testing,
      loading,
      formatTime,
      getEventTypeLabel,
      handleSave,
      handleTest
    }
  }
})
</script>

<style scoped lang="less">
.event-panel {
  max-height: calc(100vh - 180px);
  overflow-y: auto;

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

  .config-form {
    .form-tip {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 4px;
      line-height: 1.5;
    }

    .subscribe-mode-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;

      .mode-option {
        margin: 0;
        padding: 16px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        transition: all 0.2s;

        &:hover {
          border-color: var(--primary);
          background: rgba(255, 125, 69, 0.02);
        }

        :deep(.el-radio__input) {
          margin-top: 2px;
        }

        .option-content {
          margin-left: 8px;

          strong {
            display: block;
            font-size: 14px;
            color: var(--text-primary);
            margin-bottom: 4px;
          }

          .option-desc {
            font-size: 12px;
            color: var(--text-secondary);
          }
        }

        &.is-checked {
          border-color: var(--primary);
          background: rgba(255, 125, 69, 0.05);
        }
      }
    }

    .event-checkboxes {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);

      .event-label {
        strong {
          display: block;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        span {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }
}
</style>
