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
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-message">页面不存在</div>
      <div class="error-desc">请检查地址是否正确，或返回首页继续浏览。</div>
      <div class="error-actions">
        <el-button @click="goBack">返回上页</el-button>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  setup() {
    const router = useRouter()

    // 直接打开 / 新标签打开时没有历史记录，router.back() 会毫无反应
    const goBack = () => {
      if (window.history.length > 1) router.back()
      else router.push("/")
    }

    const goHome = () => router.push("/")

    return { goBack, goHome }
  }
})
</script>

<style lang="less" scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--ds-page-bg);
}

.error-content {
  text-align: center;
  padding: var(--ds-space-10) var(--ds-space-6);
}

.error-code {
  font-family: var(--ds-font-mono);
  font-size: 48px;
  font-weight: 600;
  color: var(--ds-neutral-900);
  letter-spacing: 4px;
  margin-bottom: var(--ds-space-4);
}

.error-message {
  font-size: 18px;
  font-weight: 600;
  color: var(--ds-neutral-900);
  margin-bottom: var(--ds-space-2);
}

.error-desc {
  font-size: var(--ds-fs-14);
  color: var(--ds-neutral-600);
  margin-bottom: var(--ds-space-6);
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--ds-space-2);
}
</style>
