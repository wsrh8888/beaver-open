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

import HouseIcon from "@/assets/icons/house.svg"
import KeyIcon from "@/assets/icons/key.svg"
import ChatIcon from "@/assets/icons/chat.svg"

export interface MenuItem {
  path: string
  title: string
  icon?: string
}

export interface MenuGroup {
  title: string
  icon?: string
  items: MenuItem[]
}

// 控制台首页是独立入口，不属于任何能力分组
export const dashboardMenu: MenuItem = {
  path: "/dashboard",
  title: "控制台",
  icon: HouseIcon
}

// 一级 = 能力分组，二级 = 独立模块；每块都占一个一级路由前缀。
// 三块业务能力 = OAuth 登录(/oauth) / 推送机器人(/bots) / 智能体(/digitals)，
// 各自对应 src/pages 下的独立目录，整目录可拆成独立应用。
// 智能体详情里的「知识源」是数字伙伴的子实体（open_knowledge_source 表），
// 不是一级路由，因此没有独立菜单项。
// agent 是独立运行时（app/agent、platform/agent_apps），门户只通过数字伙伴编排配置引用它，
// 没有门户 CRUD 接口，因此不单列菜单。
export const menuGroups: MenuGroup[] = [
  {
    title: "身份与接入",
    icon: KeyIcon,
    items: [{ path: "/oauth", title: "OAuth 登录" }]
  },
  {
    title: "机器人能力",
    icon: ChatIcon,
    items: [
      { path: "/bots", title: "推送机器人" },
      { path: "/digitals", title: "智能体" }
    ]
  }
]
