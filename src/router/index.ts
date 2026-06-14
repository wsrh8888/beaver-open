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
