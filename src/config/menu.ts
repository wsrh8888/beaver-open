import type { Component } from "vue"
import {
  Grid,
  House,
  UserFilled
} from "@element-plus/icons-vue"

export interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  // 🏠 控制台首页
  {
    path: "/console/dashboard",
    title: "控制台",
    icon: House
  },

  // 💼 我的应用（子菜单动态生成）
  {
    path: "/console/apps",
    title: "我的应用",
    icon: Grid
  },

  // 👤 开发者申请（未认证时显示）
  {
    path: "/console/developer/apply",
    title: "开发者申请",
    icon: UserFilled
  }
]
