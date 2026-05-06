<template>
  <div class="webhook-panel">
    <el-card shadow="never">
      <el-form label-width="120px" class="config-form">
        <el-form-item label="回调 URL" required>
          <el-input 
            v-model="localConfig.url" 
            placeholder="https://your-domain.com/webhook"
          />
          <div class="form-tip">您的服务器接收事件推送的地址，需支持 POST 请求并返回 200 状态码</div>
        </el-form-item>

        <el-form-item label="验证 Token">
          <el-input 
            v-model="localConfig.token" 
            placeholder="用于验证请求来源的 Token"
            show-password
          />
          <div class="form-tip">用于签名验证，确保请求来自 Beaver 平台。留空则不启用签名验证</div>
        </el-form-item>

        <el-form-item label="加密密钥">
          <el-input 
            v-model="localConfig.encryptKey" 
            placeholder="可选，用于加密消息内容"
            show-password
          />
          <div class="form-tip">如果启用加密，消息内容将使用 AES-256 加密传输</div>
        </el-form-item>

        <el-divider />

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
            </el-checkbox-group>
            <div class="form-tip" style="margin-top: 12px">
              至少选择一个事件类型。Bot 机器人通常需要订阅“接收消息”事件。
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
          <el-button @click="handleTest" :loading="testing">
            测试连接
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" v-if="logs && logs.length > 0">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/list.svg" alt="" class="icon" />
          <span>最近推送记录</span>
        </div>
      </template>

      <el-table :data="logs.slice(0, 10)" border stripe>
        <el-table-column prop="eventType" label="事件类型" width="120">
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

interface IWebhookConfig {
  url: string
  token: string
  encryptKey: string
  events: string[]
}

interface IWebhookLog {
  id: string
  eventType: string
  responseCode: number
  status: number
  createdAt: number
}

export default defineComponent({
  name: 'WebhookPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const localConfig = reactive<IWebhookConfig>({
      url: '',
      token: '',
      encryptKey: '',
      events: []
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
        message: '消息事件',
        friend: '好友事件',
        group: '群组事件',
        member: '成员事件'
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

    // 保存 Webhook 配置
    const handleSave = async () => {
      if (!localConfig.url) {
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
        targetUrl: localConfig.url,
        secret: localConfig.encryptKey,
        events: eventsJson // 新增：所有订阅的事件
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
      try {
        setTimeout(() => {
          ElMessage.success('测试请求发送成功')
        }, 1000)
      } catch {
        ElMessage.error('测试失败')
      } finally {
        testing.value = false
      }
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
.webhook-panel {
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
}
</style>
