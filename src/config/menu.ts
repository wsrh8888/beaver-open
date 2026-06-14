import HouseIcon from "@/assets/icons/house.svg"
import GridIcon from "@/assets/icons/grid.svg"

export interface MenuItem {
  path: string
  title: string
  icon?: string // SVG 图标路径
  children?: MenuItem[]
}

export const menuConfig: MenuItem[] = [
  // 🏠 控制台首页
  {
    path: "/console/dashboard",
    title: "控制台",
    icon: HouseIcon
  },

  // 💼 我的应用（子菜单动态生成）
  {
    path: "/console/apps",
    title: "我的应用",
    icon: GridIcon
  }
]
