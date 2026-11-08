import { resolve } from "node:path"
import vue from "@vitejs/plugin-vue"
import AutoImport from "unplugin-auto-import/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  const env = loadEnv(mode, process.cwd(), "")

  return {
    // 相对路径，便于任意子目录 / 静态托管部署
    base: "./",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src")
      }
    },
    server: {
      host: true,
      // 端口
      port: 4012,
    },
    // 为了在渲染中使用环境变量
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV)
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ["vue", "vue-router", "pinia"],
        dts: "types/auto/auto-imports.d.ts",
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        dts: "types/auto/components.d.ts",
        // main.ts 已全量引入 element-plus/dist/index.css，按需再注入组件 CSS 会重复加载
        // 且造成变量覆盖优先级不确定，故关闭按需样式
        resolvers: [ElementPlusResolver({ importStyle: false })]
      })
    ]
  }
})
