<template>
  <div class="credential-panel">
    <el-card class="credential-card" shadow="never">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/document.svg" alt="" class="icon" />
          <span>应用凭证</span>
        </div>
      </template>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <div v-else class="credential-list">
        <div class="credential-item">
          <div class="credential-label">
            <span class="label-text">AppID</span>
            <span class="label-desc">应用的唯一标识符</span>
          </div>
          <div class="credential-value">
            <code class="value-code">{{ appInfo?.appId }}</code>
            <el-button text type="primary" @click="copyToClipboard(appInfo?.appId)">
              <img src="@/assets/icons/copy.svg" alt="" class="btn-icon" />
              复制
            </el-button>
          </div>
        </div>

        <el-divider />

        <div class="credential-item">
          <div class="credential-label">
            <span class="label-text">AppSecret</span>
            <span class="label-desc">应用密钥,请妥善保管</span>
          </div>
          <div class="credential-value">
            <code class="value-code">{{ appInfo?.appSecret }}</code>
            <el-button text type="primary" @click="copyToClipboard(appInfo?.appSecret)">
              <img src="@/assets/icons/copy.svg" alt="" class="btn-icon" />
              复制
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="action-card" shadow="never">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/warning.svg" alt="" class="icon" />
          <span>危险操作</span>
        </div>
      </template>

      <div class="danger-actions">
        <div class="action-item">
          <div class="action-info">
            <h4>重置 AppSecret</h4>
            <p>重置后旧密钥立即失效,需要重新配置所有使用该密钥的服务</p>
          </div>
          <el-button type="danger" @click="handleResetSecret" :loading="resetting">
            重置密钥
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppDetailApi, resetAppSecretApi } from '@/api/app'

export default defineComponent({
  name: 'CredentialPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const appInfo = ref<any>(null)
    const loading = ref(false)
    const resetting = ref(false)

    // 工具函数

    const copyToClipboard = async (text?: string) => {
      if (!text) return
      try {
        await navigator.clipboard.writeText(text)
        ElMessage.success('复制成功')
      } catch {
        ElMessage.error('复制失败')
      }
    }

    // 加载应用详情
    const loadAppDetail = async () => {
      loading.value = true
      const res = await getAppDetailApi({ appId: props.appId })
      if (res.code === 0) {
        appInfo.value = res.result.app
      }
      loading.value = false
    }

    // 重置密钥
    const handleResetSecret = async () => {
      await ElMessageBox.confirm(
        '重置密钥后,旧密钥将立即失效,确定要重置吗?',
        '警告',
        {
          confirmButtonText: '确定重置',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      resetting.value = true
      const res = await resetAppSecretApi({ appId: props.appId })
      if (res.code === 0 && res.result?.appSecret) {
        if (appInfo.value) {
          appInfo.value.appSecret = res.result.appSecret
        }
                
        await ElMessageBox.alert(
          `新密钥:${res.result.appSecret}\n\n请妥善保存,关闭后将无法再次查看!`,
          '密钥重置成功',
          {
            confirmButtonText: '我已保存',
            type: 'success'
          }
        )
                
        ElMessage.success(res.result.message || '密钥重置成功')
      }
      resetting.value = false
    }

    onMounted(() => {
      loadAppDetail()
    })

    return {
      appInfo,
      loading,
      resetting,
      copyToClipboard,
      handleResetSecret
    }
  }
})
</script>

<style scoped lang="less">
.credential-panel {
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

  .loading-container {
    padding: var(--spacing-lg);
  }

  .credential-card,
  .action-card {
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    :deep(.el-card__header) {
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    :deep(.el-card__body) {
      padding: var(--spacing-lg);
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

  .credential-list {
    .credential-item {
      margin-bottom: var(--spacing-md);

      &:last-child {
        margin-bottom: 0;
      }

      .credential-label {
        margin-bottom: var(--spacing-sm);

        .label-text {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .label-desc {
          font-size: 12px;
          color: var(--text-tertiary);
        }
      }

      .credential-value {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);

        .value-code {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: var(--text-primary);
          word-break: break-all;
        }

        .btn-icon {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .danger-actions {
    .action-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      background: rgba(255, 82, 82, 0.04);
      border: 1px solid rgba(255, 82, 82, 0.12);
      border-radius: var(--radius-md);

      .action-info {
        h4 {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px;
        }

        p {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
        }
      }
    }
  }
}
</style>
