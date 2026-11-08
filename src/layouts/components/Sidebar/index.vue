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
  <div class="sidebar">
    <div class="logo-container">
      <router-link to="/console/dashboard" class="logo-link">
        <svg class="logo-mark" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="0" y="0" width="24" height="24" rx="6" fill="#BF4A1B" />
          <path d="M8 6.5h4.6a3.1 3.1 0 0 1 0 6.2H8V6.5Zm0 6.2h5a3.1 3.1 0 0 1 0 6.2H8v-6.2Z" fill="#FFFFFF" />
          <path d="M8 6.5h2.2v11H8v-11Z" fill="#FFFFFF" />
        </svg>
        <span class="logo-text">Beaver 开放平台</span>
      </router-link>
    </div>

    <el-scrollbar>
      <el-menu :default-active="activeMenu" mode="vertical">
        <el-menu-item :index="dashboardMenu.path" @click="handleMenuClick(dashboardMenu.path)">
          <img v-if="dashboardMenu.icon" :src="dashboardMenu.icon" alt="" class="menu-icon-img" aria-hidden="true" />
          <span>{{ dashboardMenu.title }}</span>
        </el-menu-item>

        <el-sub-menu v-for="group in menuGroups" :key="group.title" :index="group.title">
          <template #title>
            <img v-if="group.icon" :src="group.icon" alt="" class="menu-icon-img" aria-hidden="true" />
            <span>{{ group.title }}</span>
          </template>
          <el-menu-item
            v-for="item in group.items"
            :key="item.path"
            :index="item.path"
            @click="handleMenuClick(item.path)"
          >
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue"
import { useRoute, useRouter } from "vue-router"
import { dashboardMenu, menuGroups } from "../../../config/menu"

export default defineComponent({
  emits: ["navigate"],
  setup(_, { emit }) {
    const route = useRoute()
    const router = useRouter()

    // 三级路由（/console/<模块>/create|:id）下仍高亮二级模块菜单，
    // 高亮目标由路由 meta.modulePath 声明，不再靠路径前缀猜。
    const activeMenu = computed(() =>
      (route.meta.modulePath as string | undefined) || route.path
    )

    const handleMenuClick = (path: string) => {
      router.push(path)
      emit("navigate")
    }

    return { activeMenu, dashboardMenu, menuGroups, handleMenuClick }
  }
})
</script>

<style lang="less" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--ds-neutral-0);
}

.logo-container {
  height: var(--ds-navbar-height);
  flex: 0 0 var(--ds-navbar-height);
  padding: 0 var(--ds-space-4);
  border-bottom: 1px solid var(--ds-border);

  .logo-link {
    display: flex;
    align-items: center;
    gap: var(--ds-space-2);
    height: 100%;
    color: var(--ds-neutral-900);
  }

  .logo-mark {
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
  }

  .logo-text {
    font-size: 15px;
    font-weight: var(--ds-weight-medium);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.el-scrollbar {
  flex: 1;
}

.el-menu {
  border: none;
  width: 100%;
  padding: var(--ds-space-2) 0;

  .menu-icon-img {
    margin-right: var(--ds-space-2);
    width: 16px;
    height: 16px;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 40px;
    line-height: 40px;
    margin: var(--ds-space-1) var(--ds-space-3);
    border-radius: var(--ds-radius-md);
    font-size: var(--ds-fs-14);
    color: var(--ds-neutral-700);

    &:hover {
      background: var(--ds-neutral-50);
      color: var(--ds-neutral-900);
    }
  }

  :deep(.el-menu-item.is-active) {
    background: var(--ds-brand-50);
    color: var(--ds-brand);
    font-weight: var(--ds-weight-medium);
  }

  :deep(.el-sub-menu .el-menu-item) {
    padding-left: 44px !important;
    min-width: 0;
  }
}
</style>
