import type { Component } from "vue"
import {
  Bell,
  Camera,
  ChatLineRound,
  Connection,
  Cpu,
  DataAnalysis,
  Document,
  Download,
  FolderOpened,
  Grid,
  House,
  Key,
  Link,
  Lock,
  Management,
  Message,
  Monitor,
  Operation,
  Phone,
  Platform,
  Promotion,
  Rank,
  Service,
  Setting,
  Share,
  SwitchButton,
  Tools,
  TrendCharts,
  Upload,
  User,
  UserFilled,
  VideoCamera
} from "@element-plus/icons-vue"

export interface MenuItem {
  path: string
  title: string
  icon: Component
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  // 🏠 控制台
  {
    path: "/console/dashboard",
    title: "控制台",
    icon: House
  },

  // 💼 应用管理
  {
    path: "/console/apps",
    title: "我的应用",
    icon: Grid,
    children: [
      { path: "/console/apps", title: "应用列表", icon: Grid },
      { path: "/console/webhooks", title: "Webhook 管理", icon: Connection },
      { path: "/console/developer/apply", title: "开发者申请", icon: UserFilled }
    ]
  },

  // 📚 开发者资源
  {
    path: "/docs",
    title: "API 文档",
    icon: Document
  },
  {
    path: "/sdk",
    title: "SDK 下载",
    icon: Download
  }
]
