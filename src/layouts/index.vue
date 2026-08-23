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
import NavigationBar from "./components/NavigationBar/index.vue"
import Sidebar from "./components/Sidebar/index.vue"

export default defineComponent({
  components: {
    Sidebar,
    NavigationBar
  },
  setup() {
    onMounted(() => {})

    return {}
  }
})
</script>

<template>
  <div class="app-wrapper">
    <!-- 左侧菜单 -->
    <div class="sidebar-container">
      <Sidebar />
    </div>

    <!-- 右侧内容区域 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="navbar">
        <NavigationBar />
      </div>

      <!-- 主要内容 -->
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
  background: #b7b3b3;
}

.sidebar-container {
  width: 210px;
  height: 100%;
  background-color: #304156;
  overflow: auto;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 50px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  position: relative;
  z-index: 999;
}

.app-main {
  flex: 1;
  margin: 20px 10px;
  overflow: hidden;
  box-sizing: border-box;
  border-radius: 10px;
  background: #fff;
}
</style>
