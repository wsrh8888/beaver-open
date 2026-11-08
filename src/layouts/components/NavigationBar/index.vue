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
import { computed, defineComponent } from "vue"
import { useRoute, useRouter } from "vue-router"
import { User } from "@element-plus/icons-vue"
import { useUserStore } from "@/pinia/user/user"

interface Crumb {
  label: string
  to?: string
}

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()

    // 面包屑是全站唯一渲染位置。层级由路由 meta 声明：
    // 控制台 / 一级能力分组 / 二级模块（可点击回列表）/ 三级页面或实体名。
    // 详情页加载成功后会把真实名称写入 meta.entityName，避免面包屑只显示「详情」。
    const crumbs = computed<Crumb[]>(() => {
      const meta = route.meta
      const result: Crumb[] = [{ label: "控制台", to: "/console/dashboard" }]
      if (meta.group) result.push({ label: String(meta.group) })
      if (meta.module) {
        const modulePath = String(meta.modulePath || "")
        result.push({ label: String(meta.module), to: modulePath || undefined })
      }
      const leaf = meta.entityName || meta.page
      if (leaf) result.push({ label: String(leaf) })
      return result
    })

    // document.title 统一由 router.afterEach 处理（含登录页），这里不再重复写。
    const logout = () => {
      userStore.logout()
      router.push("/login")
    }

    return {
      User,
      crumbs,
      userStore,
      logout
    }
  }
})
</script>

<template>
  <div class="navigation-bar">
    <nav class="ds-breadcrumb" aria-label="面包屑">
      <template v-for="(crumb, index) in crumbs" :key="`${crumb.label}-${index}`">
        <span v-if="index > 0" class="ds-breadcrumb__sep" aria-hidden="true">/</span>
        <router-link
          v-if="crumb.to && index !== crumbs.length - 1"
          :to="crumb.to"
          class="ds-breadcrumb__link"
        >{{ crumb.label }}</router-link>
        <span
          v-else
          :class="index === crumbs.length - 1 ? 'ds-breadcrumb__current' : ''"
          :title="crumb.label"
        >{{ crumb.label }}</span>
      </template>
    </nav>

    <div class="right-menu">
      <el-dropdown>
        <div class="user-info">
          <el-avatar :icon="User" :size="28" />
          <span class="username">{{ userStore.displayName }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="less" scoped>
.navigation-bar {
  flex: 1 1 auto;
  min-width: 0;
  height: var(--ds-navbar-height);
  padding: 0 var(--ds-space-6);
  display: flex;
  align-items: center;
  gap: var(--ds-space-4);
  background: var(--ds-neutral-0);
}

.right-menu {
  flex: 0 0 auto;
  margin-left: var(--ds-space-4);

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: var(--ds-space-1) var(--ds-space-2);
    border-radius: var(--ds-radius-sm);
    transition: background-color var(--ds-duration) var(--ds-ease);

    &:hover { background: var(--ds-neutral-50); }

    .username {
      margin-left: var(--ds-space-2);
      font-size: 14px;
      color: var(--ds-neutral-900);
    }
  }
}

@media (max-width: 767px) {
  .navigation-bar { padding: 0 var(--ds-space-3); gap: var(--ds-space-2); }
  .username { display: none; }
}
</style>
