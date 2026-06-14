<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { parseOAuthCallbackParams } from '@/utils/oauthCallback'
import { handleOAuthCallback } from '@/utils/handleOAuthCallback'

export default defineComponent({
  name: 'OAuthRedirect',
  setup() {
    const router = useRouter()

    onMounted(async () => {
      const params = parseOAuthCallbackParams()
      if (params.code || params.error) {
        await handleOAuthCallback(params, router)
      } else {
        router.replace('/')
      }
    })

    return {}
  }
})
</script>

<template>
  <div class="redirect-page">
    <div class="loading">登录处理中...</div>
  </div>
</template>

<style lang="less" scoped>
.redirect-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  .loading {
    color: #666;
  }
}
</style>
