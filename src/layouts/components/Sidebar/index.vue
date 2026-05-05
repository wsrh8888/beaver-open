<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { menuConfig, type MenuItem } from "../../../config/menu"
import { getAppListApi, type IAppInfo } from "@/api/open"

export default defineComponent({
  setup() {
    const route = useRoute()
    const router = useRouter()

    // 菜单数据（包含动态应用列表）
    const menuItems = ref<MenuItem[]>([])
    const appList = ref<IAppInfo[]>([])

    // 当前激活的菜单
    const activeMenu = computed(() => route.path)

    // 处理菜单点击
    const handleMenuClick = (path: string) => {
      router.push(path)
    }

    // 加载应用列表并构建菜单
    const loadMenuItems = async () => {
      try {
        const res = await getAppListApi({ page: 1, pageSize: 100 })
        appList.value = res.result.list
        
        // 构建动态菜单
        const dynamicMenu: MenuItem[] = [
          // 🏠 控制台首页
          {
            path: "/console/dashboard",
            title: "控制台",
            icon: menuConfig.find(m => m.path === "/console/dashboard")?.icon || undefined as any
          },
          
          // 💼 我的应用（带子菜单）
          {
            path: "/console/apps",
            title: "我的应用",
            icon: menuConfig.find(m => m.path === "/console/apps")?.icon || undefined as any,
            children: [
              // 应用列表入口
              {
                path: "/console/apps",
                title: "应用列表",
                icon: undefined as any
              },
              // 动态应用子菜单
              ...appList.value.map(app => ({
                path: `/console/app/${app.appId}`,
                title: app.name,
                icon: undefined as any
              }))
            ]
          },
          
          // 👤 开发者申请
          {
            path: "/console/developer/apply",
            title: "开发者申请",
            icon: menuConfig.find(m => m.path === "/console/developer/apply")?.icon || undefined as any
          }
        ]
        
        menuItems.value = dynamicMenu
      } catch (error) {
        console.error('加载菜单失败:', error)
        // 失败时使用静态菜单
        menuItems.value = menuConfig.filter(m => m.path !== '/console/webhooks')
      }
    }

    onMounted(() => {
      loadMenuItems()
    })
    
    // 监听路由变化，刷新菜单（当创建/删除应用后）
    watch(() => route.path, () => {
      // 如果从应用列表页或应用详情页返回，刷新菜单
      if (route.path.startsWith('/console/app/') || route.path === '/console/apps') {
        loadMenuItems()
      }
    })

    return {
      menuItems,
      activeMenu,
      handleMenuClick
    }
  }
})
</script>

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
        <template v-for="item in menuItems">
          <!-- 有子菜单 -->
          <el-sub-menu
            v-if="item.children && item.children.length > 0"
            :key="`menu-${item.path}`"
            :index="item.path"
          >
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="`child-${child.path}`"
              :index="child.path"
              @click="handleMenuClick(child.path)"
            >
              <el-icon><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 无子菜单 -->
          <el-menu-item
            v-else
            :key="`single-${item.path}`"
            :index="item.path"
            @click="handleMenuClick(item.path)"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

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

  .el-icon {
    margin-right: 8px;
    width: 16px;
    height: 16px;
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

    .el-icon {
      color: #fff !important;
    }
  }

  // 子菜单项的选中状态
  .el-sub-menu .el-menu-item.is-active {
    background-color: #409eff !important;
    color: #fff !important;

    .el-icon {
      color: #fff !important;
    }
  }
}
</style>
