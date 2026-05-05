import type { Component } from "vue"
import {
  Grid,
  House
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

  // 💼 我的应用
  {
    path: "/console/apps",
    title: "我的应用",
    icon: Grid
  }
]
