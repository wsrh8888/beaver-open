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
import { defineComponent, ref } from "vue"
import NavigationBar from "./components/NavigationBar/index.vue"
import Sidebar from "./components/Sidebar/index.vue"

export default defineComponent({
  components: {
    Sidebar,
    NavigationBar
  },
  setup() {
    const drawerOpen = ref(false)

    return {
      drawerOpen
    }
  }
})
</script>

<template>
  <div class="app-wrapper" :class="{ 'is-drawer-open': drawerOpen }">
    <div v-if="drawerOpen" class="drawer-mask" @click="drawerOpen = false" />

    <!-- 左侧菜单（窄屏为抽屉） -->
    <div class="sidebar-container">
      <Sidebar @navigate="drawerOpen = false" />
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-container">
      <div class="navbar">
        <button
          class="drawer-toggle"
          type="button"
          aria-label="打开导航菜单"
          @click="drawerOpen = !drawerOpen"
        >
          <span />
          <span />
          <span />
        </button>
        <NavigationBar />
      </div>

      <!-- 全站唯一滚动容器 -->
      <div class="app-main">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.app-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  background: var(--ds-page-bg);
}

.sidebar-container {
  width: var(--ds-sidebar-width);
  flex: 0 0 var(--ds-sidebar-width);
  height: 100%;
  background: var(--ds-neutral-0);
  border-right: 1px solid var(--ds-border);
  overflow: auto;
}

.main-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  display: flex;
  align-items: center;
  height: var(--ds-navbar-height);
  flex: 0 0 var(--ds-navbar-height);
  background: var(--ds-neutral-0);
  border-bottom: 1px solid var(--ds-border);
  position: relative;
  z-index: 10;
}

.drawer-toggle {
  display: none;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  margin-left: var(--ds-space-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  background: var(--ds-neutral-0);
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;

  span {
    display: block;
    width: 16px;
    height: 1px;
    background: var(--ds-neutral-700);
  }
}

.app-main {
  flex: 1;
  min-height: 0;
  padding: var(--ds-space-6);
  overflow: auto;
  background: var(--ds-page-bg);
}

.drawer-mask {
  display: none;
}

@media (max-width: 767px) {
  .drawer-toggle { display: flex; }
  .navbar > :not(.drawer-toggle) { flex: 1; min-width: 0; }
  .app-main { padding: var(--ds-space-4); }

  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 30;
    transform: translateX(-100%);
    transition: transform var(--ds-duration) var(--ds-ease);
    box-shadow: var(--ds-shadow-2);
  }
  .is-drawer-open .sidebar-container { transform: translateX(0); }

  .drawer-mask {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 20;
    background: rgba(26, 26, 24, 0.45);
  }
}
</style>
