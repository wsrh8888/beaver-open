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
  <div class="basic-info-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/document.svg" alt="" class="icon" />
          <span>基础信息</span>
        </div>
      </template>

      <el-form label-width="120px" class="info-form">
        <el-form-item label="应用图标">
          <div class="avatar-upload">
            <img v-if="localConfig.icon" :src="localConfig.icon" alt="应用图标" class="avatar-preview" />
            <div v-else class="avatar-placeholder">
              <img src="@/assets/icons/app.svg" alt="" class="placeholder-icon" />
            </div>
            <el-input 
              v-model="localConfig.icon" 
              placeholder="请输入图标 URL 地址"
              style="margin-top: 12px"
            />
            <div class="form-tip">建议尺寸：240x240px，支持 PNG/JPG/SVG 格式</div>
          </div>
        </el-form-item>

        <el-form-item label="应用名称" required>
          <el-input 
            v-model="localConfig.name" 
            placeholder="请输入应用名称"
            maxlength="50"
            show-word-limit
          />
          <div class="form-tip">应用名称将显示在 IM 的应用中心和机器人列表中</div>
        </el-form-item>

        <el-form-item label="应用描述">
          <el-input
            v-model="localConfig.description"
            type="textarea"
            :rows="3"
            placeholder="请简要描述应用的功能和用途"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="应用分类">
          <el-select v-model="localConfig.category" placeholder="请选择应用分类">
            <el-option label="办公效率" value="productivity" />
            <el-option label="人工智能" value="ai" />
            <el-option label="项目管理" value="project" />
            <el-option label="客户服务" value="service" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="主页地址">
          <el-input 
            v-model="localConfig.homepageUrl" 
            placeholder="https://your-site.com"
          />
          <div class="form-tip">应用官方网站或产品介绍页面</div>
        </el-form-item>

        <el-form-item label="隐私政策">
          <el-input 
            v-model="localConfig.privacyUrl" 
            placeholder="https://your-site.com/privacy"
          />
          <div class="form-tip">如应用涉及用户数据，建议提供隐私政策链接</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAppDetailApi, updateAppApi } from '@/api/app'

interface IAppBasicInfo {
  name: string
  description: string
  icon: string
  category: string
  homepageUrl: string
  privacyUrl: string
}

export default defineComponent({
  name: 'BasicInfoPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const localConfig = reactive<IAppBasicInfo>({
      name: '',
      description: '',
      icon: '',
      category: '',
      homepageUrl: '',
      privacyUrl: ''
    })
    const saving = ref(false)
    const loading = ref(false)

    // 加载应用详情
    const loadAppDetail = async () => {
      loading.value = true
      const res = await getAppDetailApi({ appId: props.appId })
      if (res.code === 0 && res.result?.app) {
        const app = res.result.app
        localConfig.name = app.name || ''
        localConfig.description = app.description || ''
        localConfig.icon = app.icon || ''
        // 其他字段从扩展配置中获取（如果有的话）
      }
      loading.value = false
    }

    // 保存基础信息
    const handleSave = async () => {
      if (!localConfig.name) {
        ElMessage.warning('请输入应用名称')
        return
      }

      saving.value = true
      const res = await updateAppApi({
        appId: props.appId,
        name: localConfig.name,
        description: localConfig.description,
        icon: localConfig.icon
      })
      if (res.code === 0) {
        ElMessage.success('保存成功')
        await loadAppDetail()
      }
      saving.value = false
    }

    onMounted(() => {
      loadAppDetail()
    })

    return {
      localConfig,
      saving,
      loading,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.basic-info-panel {
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

  .info-form {
    .form-tip {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 4px;
      line-height: 1.5;
    }

    .avatar-upload {
      .avatar-preview {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-md);
        object-fit: cover;
        border: 1px solid var(--border-color);
      }

      .avatar-placeholder {
        width: 80px;
        height: 80px;
        border-radius: var(--radius-md);
        background: var(--bg-secondary);
        border: 1px dashed var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;

        .placeholder-icon {
          width: 40px;
          height: 40px;
          opacity: 0.3;
        }
      }
    }
  }
}
</style>
