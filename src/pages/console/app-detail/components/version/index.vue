<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-open-header-v1
-->

<template>
  <div class="version-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <img src="@/assets/icons/box.svg" alt="" class="icon" />
            <span>版本管理</span>
          </div>
          <el-button type="primary" @click="showCreateVersionDialog">
            <img src="@/assets/icons/plus.svg" alt="" class="btn-icon" />
            创建新版本
          </el-button>
        </div>
      </template>

      <!-- 当前状态 -->
      <el-alert
        :title="getStatusText()"
        :type="getStatusType()"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <p v-if="appStatus === 0">应用处于草稿状态，用户无法在 IM 中搜索到此应用</p>
          <p v-else-if="appStatus === 1">应用已发布，用户可以在 IM 中搜索并使用</p>
          <p v-else-if="appStatus === 2">应用已被禁用，暂时不可用</p>
        </template>
      </el-alert>

      <!-- 版本列表 -->
      <el-table :data="versions" border stripe>
        <el-table-column prop="version" label="版本号" width="120">
          <template #default="{ row }">
            <strong>{{ row.version }}</strong>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="更新说明" min-width="200" show-overflow-tooltip />
        <el-table-column prop="visibility" label="可见范围" width="150">
          <template #default="{ row }">
            <el-tag :type="getVisibilityType(row.visibility)" size="small">
              {{ getVisibilityLabel(row.visibility) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getVersionStatusType(row.status)" size="small">
              {{ getVersionStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'draft'" 
              link 
              type="primary" 
              @click="submitForReview(row)"
            >
              提交审核
            </el-button>
            <el-button 
              v-if="row.status === 'approved'" 
              link 
              type="success" 
              @click="publishVersion(row)"
            >
              发布
            </el-button>
            <el-button 
              v-if="row.status === 'published'" 
              link 
              type="info" 
              disabled
            >
              已发布
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="versions.length === 0" description="暂无版本，请创建第一个版本" />
    </el-card>

    <!-- 创建版本对话框 -->
    <el-dialog v-model="dialogVisible" title="创建新版本" width="600px">
      <el-form :model="versionForm" label-width="120px">
        <el-form-item label="版本号" required>
          <el-input 
            v-model="versionForm.version" 
            placeholder="如：1.0.0"
          />
          <div class="form-tip">遵循语义化版本规范（主版本号.次版本号.修订号）</div>
        </el-form-item>

        <el-form-item label="更新说明" required>
          <el-input 
            v-model="versionForm.description" 
            type="textarea" 
            :rows="4"
            placeholder="请详细说明本次更新的内容，例如：&#10;- 新增 Bot 机器人功能&#10;- 优化 OAuth 登录流程&#10;- 修复已知问题"
          />
        </el-form-item>

        <el-form-item label="默认可见范围" required>
          <el-select v-model="versionForm.visibility" style="width: 100%">
            <el-option label="仅自己可见" value="self">
              <span>仅自己可见</span>
              <span style="color: var(--text-tertiary); font-size: 12px; margin-left: 8px">适合个人开发测试</span>
            </el-option>
            <el-option label="部分成员可见" value="partial">
              <span>部分成员可见</span>
              <span style="color: var(--text-tertiary); font-size: 12px; margin-left: 8px">适合企业内部测试</span>
            </el-option>
            <el-option label="全员可见" value="all">
              <span>全员可见</span>
              <span style="color: var(--text-tertiary); font-size: 12px; margin-left: 8px">正式发布</span>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="默认能力">
          <el-checkbox-group v-model="versionForm.capabilities">
            <el-checkbox value="bot">
              <div class="capability-label">
                <strong>机器人</strong>
                <span>允许用户与 Bot 对话</span>
              </div>
            </el-checkbox>
            <el-checkbox value="oauth">
              <div class="capability-label">
                <strong>OAuth 登录</strong>
                <span>支持第三方快捷登录</span>
              </div>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="createVersion" :loading="creating">
          创建版本
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getVersionListApi, createVersionApi, submitVersionReviewApi, publishVersionApi } from '@/api/version'
import type { IVersionInfo } from '@/types/api/version'

interface IVersion {
  id: string
  version: string
  description: string
  visibility: 'self' | 'partial' | 'all'
  status: 'draft' | 'reviewing' | 'approved' | 'rejected' | 'published'
  capabilities: string[]
  createdAt: number
}

export default defineComponent({
  name: 'VersionPanel',
  props: {
    appId: {
      type: String,
      required: true
    },
    appStatus: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const versions = ref<IVersion[]>([])
    const dialogVisible = ref(false)
    const creating = ref(false)

    const versionForm = reactive({
      version: '',
      description: '',
      visibility: 'self' as 'self' | 'partial' | 'all',
      capabilities: ['bot']
    })

    // 加载版本列表
    const loadVersions = async () => {
      const res = await getVersionListApi({ appId: props.appId })
      if (res.code === 0 && res.result?.list) {
        versions.value = res.result.list.map((v: IVersionInfo) => ({
          id: v.id,
          version: v.version,
          description: v.description,
          visibility: v.visibility,
          status: v.status,
          capabilities: v.capabilities,
          createdAt: v.createdAt
        }))
      }
    }

    const showCreateVersionDialog = () => {
      versionForm.version = ''
      versionForm.description = ''
      versionForm.visibility = 'self'
      versionForm.capabilities = ['bot']
      dialogVisible.value = true
    }

    const createVersion = async () => {
      if (!versionForm.version) {
        ElMessage.warning('请输入版本号')
        return
      }
      if (!versionForm.description) {
        ElMessage.warning('请填写更新说明')
        return
      }

      creating.value = true
      
      const res = await createVersionApi({
        appId: props.appId,
        version: versionForm.version,
        description: versionForm.description,
        visibility: versionForm.visibility
      })
      
      if (res.code === 0) {
        ElMessage.success('版本创建成功')
        dialogVisible.value = false
        await loadVersions()
      }
      creating.value = false
    }

    const submitForReview = async (version: IVersion) => {
      await ElMessageBox.confirm(
        '提交审核后，需要等待平台审核通过才能发布。确定要提交吗？',
        '提交审核',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }
      )

      const res = await submitVersionReviewApi({
        versionId: version.id
      })
      
      if (res.code === 0) {
        ElMessage.success('已提交审核')
        version.status = 'reviewing'
      }
    }

    const publishVersion = async (version: IVersion) => {
      await ElMessageBox.confirm(
        '发布后，用户将可以在 IM 中搜索并使用此应用。确定要发布吗？',
        '发布版本',
        {
          confirmButtonText: '确定发布',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const res = await publishVersionApi({ 
        versionId: version.id
      })
      
      if (res.code === 0) {
        ElMessage.success('发布成功')
        version.status = 'published'
        // 通知父组件更新状态
      }
    }

    const formatTime = (timestamp: number) => {
      if (!timestamp) return '-'
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN')
    }

    const getStatusText = () => {
      if (props.appStatus === 0) return '草稿状态'
      if (props.appStatus === 1) return '已发布'
      if (props.appStatus === 2) return '已禁用'
      return '未知状态'
    }

    const getStatusType = (): 'info' | 'success' | 'error' => {
      if (props.appStatus === 0) return 'info'
      if (props.appStatus === 1) return 'success'
      if (props.appStatus === 2) return 'error'
      return 'info'
    }

    const getVisibilityLabel = (visibility: string) => {
      const map: Record<string, string> = {
        self: '仅自己可见',
        partial: '部分成员可见',
        all: '全员可见'
      }
      return map[visibility] || visibility
    }

    const getVisibilityType = (visibility: string) => {
      const map: Record<string, any> = {
        self: 'info',
        partial: 'warning',
        all: 'success'
      }
      return map[visibility] || 'info'
    }

    const getVersionStatusLabel = (status: string) => {
      const map: Record<string, string> = {
        draft: '草稿',
        reviewing: '审核中',
        approved: '审核通过',
        rejected: '审核拒绝',
        published: '已发布'
      }
      return map[status] || status
    }

    const getVersionStatusType = (status: string) => {
      const map: Record<string, any> = {
        draft: 'info',
        reviewing: 'warning',
        approved: 'success',
        rejected: 'danger',
        published: 'success'
      }
      return map[status] || 'info'
    }

    onMounted(() => {
      loadVersions()
    })

    return {
      versions,
      dialogVisible,
      creating,
      versionForm,
      showCreateVersionDialog,
      createVersion,
      submitForReview,
      publishVersion,
      formatTime,
      getStatusText,
      getStatusType,
      getVisibilityLabel,
      getVisibilityType,
      getVersionStatusLabel,
      getVersionStatusType
    }
  }
})
</script>

<style scoped lang="less">
.version-panel {
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

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .btn-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }

  .form-tip {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 4px;
    line-height: 1.5;
  }

  .capability-label {
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
</style>
