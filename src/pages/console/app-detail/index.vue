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

    <el-tabs v-model="activeTab" style="margin-top: 20px">
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
      <el-tab-pane label="Webhook 配置" name="webhook">
        <el-empty description="Webhook 配置功能开发中" />
      </el-tab-pane>
      <el-tab-pane label="调用统计" name="stats">
        <el-empty description="统计功能开发中" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppDetailApi, resetAppSecretApi, type IAppInfo } from '@/api/open'

const route = useRoute()
const appId = route.params.appId as string

const appInfo = ref<IAppInfo & { appSecret?: string } | null>(null)
const activeTab = ref('basic')
const showSecret = ref(false)

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
    if (res.appSecret) {
      // 更新本地数据
      if (appInfo.value) {
        appInfo.value.appSecret = res.appSecret
      }
      showSecret.value = true
      
      // 显示新密钥
      await ElMessageBox.alert(
        `新密钥：${res.appSecret}\n\n请妥善保存，关闭后将无法再次查看！`,
        '密钥重置成功',
        {
          confirmButtonText: '我已保存',
          type: 'success'
        }
      )
      
      ElMessage.success(res.message || '密钥重置成功')
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重置密钥失败:', error)
      ElMessage.error('重置密钥失败，请稍后重试')
    }
  }
}

const loadAppDetail = async () => {
  try {
    const res = await getAppDetailApi({ appId })
    appInfo.value = res.result.app
  } catch (error) {
    ElMessage.error('加载应用详情失败')
  }
}

onMounted(() => {
  loadAppDetail()
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
