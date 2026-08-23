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
  <div class="desktop-oauth">

    <el-form label-width="140px">
      <el-form-item label="启用桌面端应用">
        <el-switch v-model="enabled" />
        <div class="form-tip">
          开启后，用户才能通过 PC 客户端进行 OAuth 授权登录
        </div>
      </el-form-item>

      <el-form-item label="自定义 Scheme">
        <el-input 
          v-model="customScheme" 
          placeholder="yourapp://oauth/callback"
        />
        <div class="form-tip">
          PC 客户端的回调协议，如：yourapp://oauth/callback。需要在客户端中注册该 Scheme
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存配置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { updateOAuthConfigApi } from '@/api/oauth'
import type { IGetOAuthConfigRes } from '@/types/api/oauth'

export default defineComponent({
  name: 'DesktopOAuth',
  props: {
    appId: {
      type: String,
      required: true
    },
    oauthConfig: {
      type: Object as () => IGetOAuthConfigRes,
      default: () => ({})
    }
  },
  setup(props) {
    const enabled = ref(false)
    const customScheme = ref('')
    const authPageUrl = ref('') // 授权页面 URL（从后端获取）
    const saving = ref(false)

    // 监听父组件传来的配置
    watch(
      () => props.oauthConfig?.desktopConfig,
      (config) => {
        if (config) {
          enabled.value = config.enabled || false
          customScheme.value = config.customScheme || ''
          authPageUrl.value = config.authPageUrl || ''
        }
      },
      { immediate: true }
    )

    const handleSave = async () => {
      saving.value = true

      const config = {
        enabled: enabled.value,
        customScheme: customScheme.value
      }

      const res = await updateOAuthConfigApi({
        appId: props.appId,
        oauthType: 'desktop',
        config: JSON.stringify(config)
      })

      if (res.code === 0) {
        ElMessage.success('保存成功')
      } else {
        ElMessage.error(res.msg || '保存失败')
      }

      saving.value = false
    }

    return {
      enabled,
      customScheme,
      saving,
      authPageUrl,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.desktop-oauth {
  max-width: 800px;

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }

  pre {
    margin: 8px 0 0;
    padding: 12px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    color: #303133;
  }

  code {
    padding: 2px 6px;
    background: #f4f4f5;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    color: #e6a23c;
  }
}
</style>
