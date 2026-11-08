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
  path: "/console/dashboard",
  title: "控制台",
  icon: HouseIcon
}

// 一级 = 能力分组，二级 = 独立模块。
// 服务端已把 OAuth / Bot / Digital 拆成三个平级一级实体，前端不再用「应用」容器包装。
// 每个模块对应 src/pages/console 下的独立目录，后续可整目录拆成独立应用；
// agent 是独立运行时（app/agent、platform/agent_apps），门户只通过数字伙伴编排配置引用它，
// 没有门户 CRUD 接口，因此不单列菜单。
export const menuGroups: MenuGroup[] = [
  {
    title: "身份与接入",
    icon: KeyIcon,
    items: [{ path: "/console/oauth", title: "OAuth 登录" }]
  },
  {
    title: "机器人能力",
    icon: ChatIcon,
    items: [
      { path: "/console/bots", title: "推送机器人" },
      { path: "/console/digitals", title: "智能体" }
    ]
  }
]
