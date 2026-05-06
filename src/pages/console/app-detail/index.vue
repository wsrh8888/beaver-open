<template>
  <div class="app-detail-container">
    <!-- 顶部面包屑和返回 -->
    <div class="page-header">
      <div class="header-left">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/console/apps' }">我的应用</el-breadcrumb-item>
          <el-breadcrumb-item>应用详情</el-breadcrumb-item>
        </el-breadcrumb>
        <el-tag v-if="appStatus === 0" type="info" size="small" style="margin-left: 12px">
          草稿
        </el-tag>
        <el-tag v-else-if="appStatus === 1" type="success" size="small" style="margin-left: 12px">
          已发布
        </el-tag>
        <el-tag v-else-if="appStatus === 2" type="danger" size="small" style="margin-left: 12px">
          已禁用
        </el-tag>
      </div>
      <div class="header-right">
        <el-button 
          v-if="appStatus === 0" 
          type="primary" 
          @click="handlePublish"
        >
          发布应用
        </el-button>
        <el-button text @click="$router.back()">
          <img src="@/assets/icons/arrow-left.svg" alt="" class="btn-icon" />
          返回列表
        </el-button>
      </div>
    </div>

    <!-- 顶部 Tab 导航 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="凭证管理" name="credentials">
        <credential-panel v-if="activeTab === 'credentials'" :app-id="appId" />
      </el-tab-pane>

      <el-tab-pane label="Bot 机器人" name="bot">
        <bot-panel v-if="activeTab === 'bot'" :app-id="appId" :enable-bot="appEnableBot" @update:enable-bot="appEnableBot = $event" />
      </el-tab-pane>

      <el-tab-pane label="OAuth 登录" name="oauth">
        <oauth-panel v-if="activeTab === 'oauth'" :app-id="appId" />
      </el-tab-pane>

      <el-tab-pane label="事件订阅" name="webhook">
        <webhook-panel v-if="activeTab === 'webhook'" :app-id="appId" />
      </el-tab-pane>

      <el-tab-pane label="权限配置" name="permissions">
        <permission-panel v-if="activeTab === 'permissions'" :app-id="appId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppDetailApi, publishAppApi } from '@/api/app'
import CredentialPanel from './components/credential-panel.vue'
import BotPanel from './components/bot-panel.vue'
import OAuthPanel from './components/oauth-panel.vue'
import WebhookPanel from './components/webhook-panel.vue'
import PermissionPanel from './components/permission-panel.vue'

export default defineComponent({
  name: 'AppDetail',
  components: {
    CredentialPanel,
    BotPanel,
    OAuthPanel,
    WebhookPanel,
    PermissionPanel
  },
  setup() {
    const route = useRoute()
    const appId = route.params.appId as string

    // 状态
    const activeTab = ref('credentials')
    const appStatus = ref<number>(0) // 0=草稿，1=已发布，2=禁用
    const appEnableBot = ref<number>(0) // Bot 能力开关

    // 加载应用详情
    const loadAppDetail = async () => {
      const res = await getAppDetailApi({ appId })
      if (res.code === 0) {
        appStatus.value = res.result.app.status
        appEnableBot.value = res.result.app.enableBot
      }
    }

    // 发布应用
    const handlePublish = async () => {
      try {
        await ElMessageBox.confirm(
          '发布后，用户将可以在 IM 中搜索并使用此 Bot。确定要发布吗？',
          '发布应用',
          {
            confirmButtonText: '确定发布',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        const res = await publishAppApi({ appId })
        if (res.code === 0) {
          ElMessage.success('发布成功！')
          appStatus.value = 1 // 更新状态为已发布
        }
      } catch (error) {
        // 用户取消或请求失败
        if (error !== 'cancel') {
          ElMessage.error('发布失败')
        }
      }
    }

    onMounted(() => {
      loadAppDetail()
    })

    return {
      appId,
      activeTab,
      appStatus,
      appEnableBot,
      handlePublish
    }
  }
})
</script>

<style scoped lang="less">
@import '@/styles/design-system.css';

.app-detail-container {
  padding: var(--spacing-lg);
  background: var(--bg-secondary);
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    padding: var(--spacing-md);
    background: var(--bg-white);
    border-radius: var(--radius-md);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    .header-left {
      display: flex;
      align-items: center;
    }

    .header-right {
      display: flex;
      gap: var(--spacing-sm);
    }

    .btn-icon {
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }
  }

  // 顶部 Tab 导航
  .detail-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: var(--spacing-lg);
      background: var(--bg-white);
      padding: 0 var(--spacing-lg);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }
  }
}
</style>
