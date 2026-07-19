import type { IOAuthCallbackParams } from '@/utils/oauthCallback'
import { clearOAuthCallbackParams } from '@/utils/oauthCallback'
import { useUserStore } from '@/pinia/user/user'
import { ElMessage } from 'element-plus'
import type { Router } from 'vue-router'

export async function handleOAuthCallback(params: IOAuthCallbackParams, router: Router) {
  const userStore = useUserStore()

  if (params.error) {
    ElMessage.error(`授权失败: ${params.error}`)
    clearOAuthCallbackParams()
    router.replace('/login')
    return
  }

  if (!params.code) {
    return
  }

  try {
    const result = await userStore.oauthLogin({ code: params.code })
    clearOAuthCallbackParams()

    if (result.success) {
      ElMessage.success('登录成功')
      router.replace('/console/dashboard')
    }
  }
  catch (error: any) {
    clearOAuthCallbackParams()
    ElMessage.error(error.message || '登录失败')
    router.replace('/login')
  }
}
