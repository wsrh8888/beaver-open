/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-open
 * https://github.com/wsrh8888/beaver-open
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-open-header-v1
 */

import { createRouter, createWebHashHistory } from "vue-router"
import { useUserStore } from "@/pinia/user/user"

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 公开页面 (不需要登录)
    {
      path: "/",
      name: "Home",
      component: () => import("@/pages/home/index.vue"),
      meta: {
        title: 'Beaver 开放平台'
      }
    },
    // 控制台 (需要登录)
    {
      path: "/console",
      component: () => import("@/layouts/index.vue"),
      redirect: "/console/dashboard",
      children: [
        // 控制台首页
        {
          path: "/console/dashboard",
          name: "ConsoleDashboard",
          component: () => import("@/pages/dashboard/index.vue"),
          meta: {
            title: '控制台',
            requiresAuth: true
          }
        },
        // 应用管理
        {
          path: "/console/apps",
          name: "ConsoleApps",
          component: () => import("@/pages/console/apps/index.vue"),
          meta: {
            title: '我的应用',
            requiresAuth: true
          }
        },
        // 应用详情
        {
          path: "/console/app/:appId",
          name: "AppDetail",
          component: () => import("@/pages/console/app-detail/index.vue"),
          meta: {
            title: '应用详情',
            requiresAuth: true
          }
        },
        // 开发者申请
        {
          path: "/developer/apply",
          name: "DeveloperApply",
          component: () => import("@/pages/developer-apply/index.vue"),
          meta: {
            title: '开发者申请',
            requiresAuth: true
          }
        }
      ]
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/pages/login/index.vue")
    },
    {
      path: "/redirect",
      name: "Redirect",
      component: () => import("@/pages/redirect/index.vue")
    },
    {
      path: "/redirect/:path(.*)",
      name: "RedirectCatch",
      component: () => import("@/pages/redirect/index.vue")
    },
    {
      path: "/error/404",
      name: "Error404",
      component: () => import("@/pages/error/404.vue")
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/error/404"
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 公开页面、OAuth 回调页直接放行
  if (to.path === "/login" || to.path === "/" || to.path.startsWith("/redirect")) {
    next()
    return
  }

  // 检查是否已登录
  if (!userStore.isLoggedIn) {
    next("/login")
    return
  }

  next()
})

export default router
