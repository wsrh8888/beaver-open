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
    <!-- Logo区域 -->
    <div class="logo-container">
      <router-link to="/" class="logo-link">
        <div class="logo-content">
          <img src="@/assets/logo.png" alt="logo" class="logo-img" />
          <span class="logo-text">海狸IM</span>
        </div>
      </router-link>
    </div>

    <!-- 菜单区域 -->
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        mode="vertical"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#fff"
      >
        <template v-for="item in menuItems" :key="`menu-${item.path}`">
          <!-- 菜单项 -->
          <el-menu-item
            :index="item.path"
            @click="handleMenuClick(item.path)"
          >
            <img v-if="item.icon" :src="item.icon" alt="" class="menu-icon-img" />
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { menuConfig, type MenuItem } from "../../../config/menu"
export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 菜单数据

    // 当前激活的菜单
    const activeMenu = computed(() => route.path)

    // 处理菜单点击
    const handleMenuClick = (path: string) => {
      router.push(path)
    }



    onMounted(() => {
    })

    return {
      activeMenu,
      handleMenuClick,
      menuItems: menuConfig
    }
  }
})
</script>

<style lang="less" scoped>
.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// Logo样式
.logo-container {
  height: 60px;
  padding: 10px;
  border-bottom: 1px solid #263445;

  .logo-link {
    display: block;
    height: 100%;
    text-decoration: none;

    .logo-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      .logo-img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
        border-radius: 8px;
        background: #fff;
        object-fit: cover;
      }

      .logo-text {
        font-size: 16px;
        font-weight: 500;
        color: #fff;
      }
    }

    &:hover {
      .logo-content {
        opacity: 0.8;
      }
    }
  }
}

// 菜单样式
.el-scrollbar {
  flex: 1;
}

.el-menu {
  border: none;
  width: 100%;

  .menu-icon-img {
    margin-right: 8px;
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }

  .el-menu-item,
  .el-sub-menu__title {
    height: 50px;
    line-height: 50px;

    &:hover {
      background-color: #263445 !important;
      color: #fff !important;
    }
  }

  .el-menu-item.is-active {
    background-color: #409eff !important;
    color: #fff !important;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 4px;
      height: 100%;
      background-color: #fff;
    }
  }
}
</style>
