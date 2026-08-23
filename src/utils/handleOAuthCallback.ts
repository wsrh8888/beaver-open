/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-open
 * https://github.com/wsrh8888/beaver-open
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-open-header-v1
 */

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
