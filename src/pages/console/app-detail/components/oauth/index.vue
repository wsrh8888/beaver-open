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
  <div class="oauth-panel">
    <el-tabs v-model="activeTab" type="card">
      <!-- Tab 1: H5 应用 -->
      <el-tab-pane label="H5 应用" name="h5">
        <H5OAuth :app-id="appId" :oauth-config="oauthConfig" />
      </el-tab-pane>

      <!-- Tab 2: 桌面端应用 -->
      <el-tab-pane label="桌面端应用" name="desktop">
        <DesktopOAuth :app-id="appId" :oauth-config="oauthConfig" />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { getOAuthConfigApi } from '@/api/oauth'
import type { IGetOAuthConfigRes } from '@/types/api/oauth'
import H5OAuth from './h5-oauth.vue'
import DesktopOAuth from './desktop-oauth.vue'
import MobileOAuth from './mobile-oauth.vue'

export default defineComponent({
  name: 'OAuthPanel',
  components: {
    H5OAuth,
    DesktopOAuth,
    MobileOAuth
  },
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const activeTab = ref('h5')
    const oauthConfig = ref<IGetOAuthConfigRes>({})

    // 一次性加载所有 OAuth 配置
    const loadOAuthConfig = async () => {
      const res = await getOAuthConfigApi({
        appId: props.appId
      })
      if (res.code === 0 && res.result) {
        oauthConfig.value = res.result
      }
    }

    onMounted(() => {
      loadOAuthConfig()
    })

    return {
      activeTab,
      oauthConfig
    }
  }
})
</script>

<style scoped lang="less">
.oauth-panel {
  padding: 24px;
  height: 100%;

  :deep(.el-tabs) {
    height: 100%;
  }

  :deep(.el-tabs__content) {
    padding-top: 20px;
  }
}
</style>
