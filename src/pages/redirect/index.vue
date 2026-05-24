<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/pinia/user/user'

export default defineComponent({
  name: 'OAuthRedirect',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const userStore = useUserStore()

    onMounted(async () => {
      const { code, state, error } = route.query

      // 检查是否有错误
      if (error) {
        ElMessage.error(`授权失败: ${error}`)
        router.push('/login')
        return
      }

      // 验证 state 防止 CSRF 攻击
      const savedState = localStorage.getItem('oauth_state')
      if (!state || state !== savedState) {
        ElMessage.error('授权验证失败，请重新登录')
        localStorage.removeItem('oauth_state')
        router.push('/login')
        return
      }

      // 清除 state
      localStorage.removeItem('oauth_state')

      // 如果没有 code，说明不是 OAuth 回调，执行原有的重定向逻辑
      if (!code) {
        router.replace({ path: `/${route.params.path}`, query: route.query })
        return
      }

      try {
        // TODO: 用 code 换取 token
        // 这里需要调用后端 API，用 code 换取 access_token
        // const res = await exchangeCodeForTokenApi({ code })
        // if (res.code === 0) {
        //   userStore.setToken(res.result.accessToken)
        //   userStore.setUserId(res.result.userId)
        //   userStore.setNickName(res.result.nickName)
        //   ElMessage.success('登录成功')
        //   router.push('/console/dashboard')
        // }
        
        // 临时方案：模拟登录成功（实际需要后端支持）
        console.log('OAuth code:', code)
        ElMessage.warning('OAuth 回调处理待实现，需要后端支持 code 换 token 接口')
        router.push('/login')
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败')
        router.push('/login')
      }
    })

    return {}
  }
})
</script>

<template>
  <div class="redirect-page">
    <div class="loading">
      <el-loading-text>页面跳转中...</el-loading-text>
    </div>
  </div>
</template>

<style lang="less" scoped>
.redirect-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.loading {
  text-align: center;
  color: #666;
}
</style>
