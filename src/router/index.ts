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
    // 根路径只做分流：未登录进登录页，已登录进控制台。
    // SDK / 接入 / 接口文档统一由 beaver-docs 承载，本应用只包含登录 + 控制台。
    {
      path: "/",
      name: "Entry",
      redirect: () => (useUserStore().isLoggedIn ? "/console/dashboard" : "/login")
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
        // 三级信息架构：一级能力分组（侧栏）→ 二级模块列表 → 三级创建页 / 详情页。
        // 每个模块一个独立目录，整目录可拆成独立应用；详情页内的分区再由 ?tab= 深链。
        // meta.modulePath 供侧栏在三级路径下仍高亮二级菜单，也供面包屑回列表。

        // 身份与接入 / OAuth 登录（对应服务端 open_oauth）
        {
          path: "/console/oauth",
          name: "ConsoleOAuth",
          component: () => import("@/pages/console/oauth/index.vue"),
          meta: {
            title: "OAuth 登录",
            requiresAuth: true,
            group: "身份与接入",
            module: "OAuth 登录",
            modulePath: "/console/oauth"
          }
        },
        {
          path: "/console/oauth/create",
          name: "ConsoleOAuthCreate",
          component: () => import("@/pages/console/oauth/create.vue"),
          meta: {
            title: "创建 OAuth 应用",
            requiresAuth: true,
            group: "身份与接入",
            module: "OAuth 登录",
            modulePath: "/console/oauth",
            page: "创建应用"
          }
        },
        {
          path: "/console/oauth/:oauthId",
          name: "ConsoleOAuthDetail",
          component: () => import("@/pages/console/oauth/detail/index.vue"),
          meta: {
            title: "应用详情",
            requiresAuth: true,
            group: "身份与接入",
            module: "OAuth 登录",
            modulePath: "/console/oauth",
            page: "应用详情"
          }
        },

        // 机器人能力 / 推送机器人（对应服务端 open_bot）
        {
          path: "/console/bots",
          name: "ConsoleBots",
          component: () => import("@/pages/console/bots/index.vue"),
          meta: {
            title: "推送机器人",
            requiresAuth: true,
            group: "机器人能力",
            module: "推送机器人",
            modulePath: "/console/bots"
          }
        },
        {
          path: "/console/bots/create",
          name: "ConsoleBotsCreate",
          component: () => import("@/pages/console/bots/create.vue"),
          meta: {
            title: "创建推送机器人",
            requiresAuth: true,
            group: "机器人能力",
            module: "推送机器人",
            modulePath: "/console/bots",
            page: "创建机器人"
          }
        },
        {
          path: "/console/bots/:botId",
          name: "ConsoleBotsDetail",
          component: () => import("@/pages/console/bots/detail/index.vue"),
          meta: {
            title: "机器人详情",
            requiresAuth: true,
            group: "机器人能力",
            module: "推送机器人",
            modulePath: "/console/bots",
            page: "机器人详情"
          }
        },

        // 机器人能力 / 智能体（对应服务端 open_digital）
        {
          path: "/console/digitals",
          name: "ConsoleDigitals",
          component: () => import("@/pages/console/digitals/index.vue"),
          meta: {
            title: "智能体",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/console/digitals"
          }
        },
        // 创建与修改共用一个工作台：create 是草稿态，:digitalId 是实体态。
        // 草稿态填完任一分区点保存即先落库，再原地 replace 到真实 ID。
        {
          path: "/console/digitals/create",
          name: "ConsoleDigitalsCreate",
          component: () => import("@/pages/console/digitals/detail/index.vue"),
          meta: {
            title: "新建智能体",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/console/digitals",
            page: "新建智能体",
            isNew: true
          }
        },
        {
          path: "/console/digitals/:digitalId",
          name: "ConsoleDigitalsDetail",
          component: () => import("@/pages/console/digitals/detail/index.vue"),
          meta: {
            title: "智能体详情",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/console/digitals",
            page: "智能体详情"
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

  // 公开页面、OAuth 回调页直接放行（"/" 已在路由表分流，不会以此路径到达守卫）
  if (to.path === "/login" || to.path.startsWith("/redirect") || to.path === "/error/404") {
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

// 浏览器标签标题的唯一写入点：详情页异步加载到真实名称后会写 meta.entityName，
// 并在加载完成时再写一次 document.title（afterEach 此时已经跑过）。
router.afterEach((to) => {
  const title = (to.meta.entityName as string) || (to.meta.title as string) || ""
  document.title = title && title !== "Beaver 开放平台"
    ? `${title} · Beaver 开放平台`
    : "Beaver 开放平台"
})

export default router
