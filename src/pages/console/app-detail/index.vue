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

    <!-- 主体内容：左侧导航 + 右侧内容 -->
    <div class="app-content">
      <!-- 左侧导航（对标飞书） -->
      <el-aside width="240px" class="app-sidebar">
        <div class="app-header">
          <img v-if="appInfo.icon" :src="appInfo.icon" alt="" class="app-icon" />
          <div v-else class="app-icon-placeholder">
            <img src="@/assets/icons/app.svg" alt="" class="placeholder-icon" />
          </div>
          <h3 class="app-name">{{ appInfo.name || '未命名应用' }}</h3>
          <p class="app-id">App ID: {{ appId }}</p>
        </div>
        
        <el-menu 
          :default-active="activeMenu" 
          @select="handleMenuSelect"
          class="sidebar-menu"
        >
          <el-menu-item index="basic">
            <img src="@/assets/icons/document.svg" alt="" class="menu-icon" />
            <span>凭证与基础信息</span>
          </el-menu-item>
          
          <el-menu-item index="bot">
            <img src="@/assets/icons/chat.svg" alt="" class="menu-icon" />
            <span>机器人</span>
            <el-tag v-if="appEnableBot === 1" size="small" type="success" style="margin-left: auto">已启用</el-tag>
          </el-menu-item>
          
          <el-menu-item index="oauth">
            <img src="@/assets/icons/key.svg" alt="" class="menu-icon" />
            <span>OAuth 登录</span>
          </el-menu-item>
          
          <el-menu-item index="events">
            <img src="@/assets/icons/bell.svg" alt="" class="menu-icon" />
            <span>事件与回调</span>
          </el-menu-item>
          
          <el-menu-item index="permissions">
            <img src="@/assets/icons/lock.svg" alt="" class="menu-icon" />
            <span>权限管理</span>
          </el-menu-item>
          
          <el-menu-item index="security">
            <img src="@/assets/icons/shield.svg" alt="" class="menu-icon" />
            <span>安全设置</span>
          </el-menu-item>
          
          <el-menu-item index="versions">
            <img src="@/assets/icons/box.svg" alt="" class="menu-icon" />
            <span>版本管理与发布</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 右侧内容区 -->
      <el-main class="app-main">
        <component :is="currentComponent" :app-id="appId" :app-status="appStatus" :enable-bot="appEnableBot" @update:enable-bot="appEnableBot = $event" />
      </el-main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppDetailApi, publishAppApi } from '@/api/app'
import type { IAppInfo } from '@/types/api/app'
import BasicInfoPanel from './components/basic-info-panel.vue'
import CredentialPanel from './components/credential-panel.vue'
import BotPanel from './components/bot-panel.vue'
import OAuthPanel from './components/oauth-panel.vue'
import EventPanel from './components/event-panel.vue'
import PermissionPanel from './components/permission-panel.vue'
import SecurityPanel from './components/security-panel.vue'
import VersionPanel from './components/version-panel.vue'

export default defineComponent({
  name: 'AppDetail',
  components: {
    BasicInfoPanel,
    CredentialPanel,
    BotPanel,
    OAuthPanel,
    EventPanel,
    PermissionPanel,
    SecurityPanel,
    VersionPanel
  },
  setup() {
    const route = useRoute()
    const appId = route.params.appId as string

    // 状态
    const activeMenu = ref('basic')
    const appStatus = ref<number>(0) // 0=草稿，1=已发布，2=禁用
    const appEnableBot = ref<number>(0) // Bot 能力开关
    const appInfo = ref<IAppInfo>({
      appId: '',
      name: '',
      description: '',
      icon: '',
      appSecret: '',
      status: 0,
      enableBot: 0,
      enableOAuth: 0,
      enableWebhook: 0,
      createdAt: 0
    })

    // 当前组件
    const currentComponent = computed(() => {
      const componentMap: Record<string, any> = {
        basic: BasicInfoPanel,
        credentials: CredentialPanel,
        bot: BotPanel,
        oauth: OAuthPanel,
        events: EventPanel,
        permissions: PermissionPanel,
        security: SecurityPanel,
        versions: VersionPanel
      }
      return componentMap[activeMenu.value] || BasicInfoPanel
    })

    // 加载应用详情
    const loadAppDetail = async () => {
      const res = await getAppDetailApi({ appId })
      if (res.code === 0) {
        appInfo.value = res.result.app
        appStatus.value = res.result.app.status
        appEnableBot.value = res.result.app.enableBot
      }
    }

    // 菜单选择
    const handleMenuSelect = (index: string) => {
      activeMenu.value = index
    }

    // 发布应用
    const handlePublish = async () => {
      await ElMessageBox.confirm(
        '发布后，用户将可以在 IM 中搜索并使用此应用。确定要发布吗？',
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
    }

    onMounted(() => {
      loadAppDetail()
    })

    return {
      appId,
      activeMenu,
      appStatus,
      appEnableBot,
      appInfo,
      currentComponent,
      handleMenuSelect,
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

  // 主体内容布局
  .app-content {
    display: flex;
    gap: var(--spacing-lg);
    min-height: calc(100vh - 180px);

    // 左侧导航
    .app-sidebar {
      background: var(--bg-white);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      overflow: hidden;

      .app-header {
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
        text-align: center;

        .app-icon,
        .app-icon-placeholder {
          width: 64px;
          height: 64px;
          margin: 0 auto var(--spacing-sm);
          border-radius: var(--radius-md);
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .app-icon-placeholder {
          background: var(--bg-secondary);
          border: 1px dashed var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;

          .placeholder-icon {
            width: 32px;
            height: 32px;
            opacity: 0.3;
          }
        }

        .app-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 var(--spacing-xs);
        }

        .app-id {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          font-family: 'Courier New', monospace;
        }
      }

      .sidebar-menu {
        border: none;

        :deep(.el-menu-item) {
          height: 48px;
          line-height: 48px;
          margin: 4px 8px;
          border-radius: var(--radius-sm);

          .menu-icon {
            width: 18px;
            height: 18px;
            margin-right: 8px;
          }

          &.is-active {
            background: var(--primary-light);
            color: var(--primary);
          }

          &:hover:not(.is-active) {
            background: var(--bg-secondary);
          }
        }
      }
    }

    // 右侧内容区
    .app-main {
      flex: 1;
      padding: 0;
      background: var(--bg-white);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }
  }
}
</style>
