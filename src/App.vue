<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn"
import { useRouter } from "vue-router"
import { useUserStore } from "@/pinia/user/user"
import { parseOAuthCallbackParams } from "@/utils/oauthCallback"
import { handleOAuthCallback } from "@/utils/handleOAuthCallback"

export default defineComponent({
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    onMounted(async () => {
      userStore.initUserInfo()

      // hash 路由下 OAuth 回调的 code 在 # 前的 search 里，任意页面都可能收到
      const params = parseOAuthCallbackParams()
      if (params.code || params.error) {
        await handleOAuthCallback(params, router)
      }
    })

    return {
      zhCn
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
</style>
