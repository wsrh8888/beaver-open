<template>
  <div class="event-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/bell.svg" alt="" class="icon" />
          <span>事件订阅配置</span>
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
          <p style="margin-top: 8px"><strong>知音楼标准：</strong>配置回调 URL 后，IM 平台会以 HTTP POST 方式推送加密的事件数据到您的服务器。</p>
        </template>
      </el-alert>

      <el-form label-width="120px" class="config-form">
        <el-form-item label="回调 URL" required>
          <el-input 
            v-model="localConfig.url" 
            placeholder="https://your-domain.com/webhook"
          />
          <div class="form-tip">
            您的服务器需支持 HTTPS，并能被 Beaver 服务器访问。URL 需返回 200 状态码。
          </div>
        </el-form-item>

        <el-form-item label="Encrypt Key">
          <el-input 
            v-model="localConfig.secret" 
            placeholder="用于签名验证和消息加密"
            show-password
          />
          <div class="form-tip">
            用于签名验证（X-Signature）和消息内容 AES-256 加密。留空则不启用加密。
          </div>
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
              <el-checkbox value="im.friend.request_v1">
                <div class="event-label">
                  <strong>好友申请</strong>
                  <span>用户向 Bot 发送好友申请时触发</span>
                </div>
              </el-checkbox>
              <el-checkbox value="im.group.created_v1">
                <div class="event-label">
                  <strong>群组创建</strong>
                  <span>创建新群组时触发</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <el-divider />

        <el-form-item label="重试次数">
          <el-input-number 
            v-model="localConfig.retryCount" 
            :min="0" 
            :max="10"
            style="width: 100%"
          />
          <div class="form-tip">失败后的重试次数（知音楼标准：60s、10m、30m、2h，共4次）</div>
        </el-form-item>

        <el-form-item label="超时时间">
          <el-input-number 
            v-model="localConfig.timeout" 
            :min="1" 
            :max="30"
            style="width: 100%"
          />
          <span style="margin-left: 8px">秒</span>
          <div class="form-tip">知音楼要求 3000ms 内响应，建议设置为 3-5 秒</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
          <el-button @click="loadSubscriptions">
            刷新列表
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 已配置的订阅列表 -->
    <el-card shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-title">
          <span>已配置的事件订阅</span>
        </div>
      </template>

      <el-table :data="subscriptions" v-loading="loading" style="width: 100%">
        <el-table-column prop="eventType" label="事件类型" width="200">
          <template #default="{ row }">
            {{ getEventTypeLabel(row.eventType) }}
          </template>
        </el-table-column>
        <el-table-column prop="targetUrl" label="回调 URL" min-width="300" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="retryCount" label="重试次数" width="100" />
        <el-table-column prop="timeout" label="超时(秒)" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              text 
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              type="danger" 
              text 
              size="small"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createEventSubscriptionApi,
  listEventSubscriptionsApi,
  updateEventSubscriptionApi,
  deleteEventSubscriptionApi,
  type IEventSubscriptionInfo
} from '@/api/event'

interface IEventConfig {
  url: string
  secret: string
  events: string[]
  retryCount: number
  timeout: number
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
      url: '',
      secret: '',
      events: [],
      retryCount: 3,
      timeout: 5
    })
    const subscriptions = ref<IEventSubscriptionInfo[]>([])
    const saving = ref(false)
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

    // 加载事件订阅列表
    const loadSubscriptions = async () => {
      loading.value = true
      try {
        const res = await listEventSubscriptionsApi({ 
          appId: props.appId,
          page: 1,
          pageSize: 50
        })
        if (res.code === 0) {
          subscriptions.value = res.result.list || []
        }
      } catch (error) {
        ElMessage.error('加载事件订阅失败')
      } finally {
        loading.value = false
      }
    }

    // 保存事件订阅配置
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
      
      try {
        // 为每个选中的事件类型创建订阅
        for (const eventType of localConfig.events) {
          await createEventSubscriptionApi({
            appId: props.appId,
            eventType,
            targetUrl: localConfig.url,
            secret: localConfig.secret,
            retryCount: localConfig.retryCount,
            timeout: localConfig.timeout
          })
        }
        
        ElMessage.success('事件订阅配置保存成功')
        await loadSubscriptions()
        
        // 清空表单
        localConfig.url = ''
        localConfig.secret = ''
        localConfig.events = []
      } catch (error) {
        ElMessage.error('保存失败')
      } finally {
        saving.value = false
      }
    }

    // 切换订阅状态
    const toggleStatus = async (subscription: IEventSubscriptionInfo) => {
      try {
        await updateEventSubscriptionApi({
          id: subscription.id,
          status: subscription.status === 1 ? 0 : 1
        })
        ElMessage.success('状态更新成功')
        await loadSubscriptions()
      } catch (error) {
        ElMessage.error('更新失败')
      }
    }

    // 删除订阅
    const handleDelete = async (subscription: IEventSubscriptionInfo) => {
      try {
        await ElMessageBox.confirm('确定要删除此事件订阅吗？', '提示', {
          type: 'warning'
        })
        
        await deleteEventSubscriptionApi({
          id: subscription.id
        })
        
        ElMessage.success('删除成功')
        await loadSubscriptions()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    onMounted(() => {
      loadSubscriptions()
    })

    return {
      localConfig,
      subscriptions,
      saving,
      loading,
      formatTime,
      getEventTypeLabel,
      loadSubscriptions,
      handleSave,
      toggleStatus,
      handleDelete
    }
  }
})
</script>

<style scoped>
.event-panel {
  padding: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.icon {
  width: 20px;
  height: 20px;
}

.config-form {
  max-width: 800px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.event-section {
  width: 100%;
}

.event-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-checkboxes :deep(.el-checkbox) {
  margin-right: 0;
  width: 100%;
}

.event-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-label strong {
  font-size: 14px;
  color: #303133;
}

.event-label span {
  font-size: 12px;
  color: #909399;
}
</style>
