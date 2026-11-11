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

/**
 * 路由按业务板块划分，不再把所有东西塞进同一个旧版控制台壳：
 * - /oauth      身份与接入（OAuth 登录）
 * - /bots       机器人能力（推送机器人）
 * - /digitals   机器人能力（智能体）
 * 三块都是一级路径，共享同一个 layout 壳；每块在 src/pages 下有独立目录，
 * 目录内部再按「列表 / 创建 / 详情 / 分区」拆分，整目录可独立拆成应用。
 * 智能体详情里的「知识源」是数字伙伴的子实体，挂在 /digitals/:digitalId 下，
 * 不是一级路由。
 * /dashboard 是控制台首页，/login、/redirect、/error/404 属于 pages/common 特殊页。
 *
 * meta.modulePath 供侧栏在三级路径下仍高亮二级菜单，也供面包屑回列表。
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 公开页：登录、OAuth 回调中转、404
    {
      path: "/login",
      name: "Login",
      component: () => import("@/pages/common/login/index.vue"),
      meta: { title: "登录", public: true }
    },
    {
      path: "/redirect",
      name: "Redirect",
      component: () => import("@/pages/common/redirect/index.vue"),
      meta: { public: true }
    },
    {
      path: "/redirect/:path(.*)",
      name: "RedirectCatch",
      component: () => import("@/pages/common/redirect/index.vue"),
      meta: { public: true }
    },
    {
      path: "/error/404",
      name: "Error404",
      component: () => import("@/pages/common/error/404.vue"),
      meta: { title: "页面不存在", public: true }
    },

    // 应用壳：所有业务板块共用的侧栏 / 顶栏
    {
      path: "/",
      component: () => import("@/layouts/index.vue"),
      redirect: () => (useUserStore().isLoggedIn ? "/dashboard" : "/login"),
      children: [
        // 控制台首页
        {
          path: "/dashboard",
          name: "Dashboard",
          component: () => import("@/pages/dashboard/index.vue"),
          meta: { title: "控制台", requiresAuth: true }
        },

        // ① 身份与接入 / OAuth 登录
        {
          path: "/oauth",
          name: "OAuth",
          component: () => import("@/pages/oauth/list/index.vue"),
          meta: {
            title: "OAuth 登录",
            requiresAuth: true,
            group: "身份与接入",
            module: "OAuth 登录",
            modulePath: "/oauth"
          }
        },
        {
          path: "/oauth/create",
          name: "OAuthCreate",
          component: () => import("@/pages/oauth/create/index.vue"),
          meta: {
            title: "创建 OAuth 应用",
            requiresAuth: true,
            group: "身份与接入",
            module: "OAuth 登录",
            modulePath: "/oauth",
            page: "创建应用"
          }
        },
        {
          path: "/oauth/:oauthId",
          name: "OAuthDetail",
          component: () => import("@/pages/oauth/detail/index.vue"),
          meta: {
            title: "应用详情",
            requiresAuth: true,
            group: "身份与接入",
            module: "OAuth 登录",
            modulePath: "/oauth",
            page: "应用详情"
          }
        },

        // ② 机器人能力 / 推送机器人
        {
          path: "/bots",
          name: "Bots",
          component: () => import("@/pages/bots/list/index.vue"),
          meta: {
            title: "推送机器人",
            requiresAuth: true,
            group: "机器人能力",
            module: "推送机器人",
            modulePath: "/bots"
          }
        },
        {
          path: "/bots/:botId",
          name: "BotsDetail",
          component: () => import("@/pages/bots/detail/index.vue"),
          meta: {
            title: "机器人详情",
            requiresAuth: true,
            group: "机器人能力",
            module: "推送机器人",
            modulePath: "/bots",
            page: "机器人详情"
          }
        },

        // ③ 机器人能力 / 智能体
        {
          path: "/digitals",
          name: "Digitals",
          component: () => import("@/pages/digitals/list/index.vue"),
          meta: {
            title: "智能体",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/digitals"
          }
        },
        // 创建与修改共用一个工作台：create 是草稿态，:digitalId 是实体态。
        // 草稿态填完任一分区点保存即先落库，再原地 replace 到真实 ID。
        {
          path: "/digitals/create",
          name: "DigitalsCreate",
          component: () => import("@/pages/digitals/detail/index.vue"),
          meta: {
            title: "新建智能体",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/digitals",
            page: "新建智能体",
            isNew: true
          }
        },
        // 创建知识源：点「创建知识源」直接进这个子路由（先选数据源，再落库），
        // 不再在列表页弹输入框。必须排在 :knowledgeSourceId 之前，否则 create 会被当成 id。
        {
          path: "/digitals/:digitalId/knowledge/create",
          name: "DigitalKnowledgeSourceCreate",
          component: () => import("@/pages/digitals/knowledge-source/create.vue"),
          meta: {
            title: "创建知识源",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/digitals",
            page: "创建知识源",
            isNew: true
          }
        },
        // 知识源是智能体下的子实体，独立成一级子路由（不再是详情 tab 的内部视图）。
        // ?add=1 表示刚创建完空知识源，进来先走「选择数据源」向导。
        {
          path: "/digitals/:digitalId/knowledge/:knowledgeSourceId",
          name: "DigitalKnowledgeSourceDetail",
          component: () => import("@/pages/digitals/knowledge-source/index.vue"),
          meta: {
            title: "知识源",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/digitals",
            page: "知识源"
          }
        },
        {
          path: "/digitals/:digitalId",
          name: "DigitalsDetail",
          component: () => import("@/pages/digitals/detail/index.vue"),
          meta: {
            title: "智能体详情",
            requiresAuth: true,
            group: "机器人能力",
            module: "智能体",
            modulePath: "/digitals",
            page: "智能体详情"
          }
        }
      ]
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/error/404"
    }
  ]
})

// 路由守卫：公开页放行，其余必须已登录
router.beforeEach((to, _from, next) => {
  if (to.meta.public === true) {
    next()
    return
  }
  if (!useUserStore().isLoggedIn) {
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
