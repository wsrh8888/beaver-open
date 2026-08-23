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

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { parseOAuthCallbackParams } from '@/utils/oauthCallback'
import { handleOAuthCallback } from '@/utils/handleOAuthCallback'

export default defineComponent({
  name: 'OAuthRedirect',
  setup() {
    const router = useRouter()

    onMounted(async () => {
      const params = parseOAuthCallbackParams()
      if (params.code || params.error) {
        await handleOAuthCallback(params, router)
      } else {
        router.replace('/')
      }
    })

    return {}
  }
})
</script>

<template>
  <div class="redirect-page">
    <div class="loading">登录处理中...</div>
  </div>
</template>

<style lang="less" scoped>
.redirect-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  .loading {
    color: #666;
  }
}
</style>
