<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-open-header-v1

  开发者选项：只展示 OAuth 登录需要的两个值 —— OAuth ID / OAuthSecret。
  OAuthSecret 明文只在创建 / 重置时返回一次，详情接口只返回掩码。
-->

<template>
  <div>
    <FormCard title="OAuth 登录能力">
      <h4 class="dv-subtitle">应用密钥</h4>

      <div class="ds-summary">
        <span class="ds-summary__key">OAuth ID</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ app.oauthId }}</code>
          <el-button link type="primary" @click="copyText(app.oauthId, 'OAuth ID 已复制')">复制</el-button>
        </span>

        <span class="ds-summary__key">OAuthSecret</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ secretText }}</code>
          <el-button
            v-if="flashVisible"
            link
            type="primary"
            @click="copyText(secretText, 'OAuthSecret 已复制')"
          >
            复制
          </el-button>
          <el-button v-if="flashVisible" link @click="dismiss">我已保存</el-button>
        </span>
      </div>

      <template #footer>
        <el-button type="danger" plain :loading="resetting" @click="resetSecret">
          重置 OAuthSecret
        </el-button>
      </template>
    </FormCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { resetOAuthSecretApi } from "@/api/oauth"
import type { IOAuthAppInfo } from "@/types/api/oauth"
import FormCard from "@/pages/digitals/components/FormCard.vue"
import {
  clearOAuthCredentialFlash,
  oauthCredentialFlash,
  setOAuthCredentialFlash
} from "@/pages/oauth/credentialFlash"

const props = defineProps<{ app: IOAuthAppInfo }>()

const resetting = ref(false)

const flashVisible = computed(
  () => !!oauthCredentialFlash.oauthId && oauthCredentialFlash.oauthId === props.app.oauthId
)
const secretText = computed(() =>
  flashVisible.value && oauthCredentialFlash.oauthSecret
    ? oauthCredentialFlash.oauthSecret
    : props.app.oauthSecret || "—"
)

async function copyText(text: string, label = "已复制") {
  if (!text) {
    ElMessage.warning("内容为空")
    return
  }
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
    } else {
      const el = document.createElement("textarea")
      el.value = text
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(el)
      if (!ok) throw new Error("execCommand copy failed")
    }
    ElMessage.success(label)
  } catch {
    ElMessage.error("复制失败，请手动选中复制")
  }
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

function dismiss() {
  clearOAuthCredentialFlash()
}

async function resetSecret() {
  try {
    await ElMessageBox.confirm(
      "旧 OAuthSecret 立即失效，正在使用它的服务会立刻鉴权失败。确认换发？",
      "重置应用密钥",
      { type: "warning", confirmButtonText: "确认换发", cancelButtonText: "取消" }
    )
  } catch {
    return
  }
  resetting.value = true
  try {
    const res = await resetOAuthSecretApi({ oauthId: props.app.oauthId })
    if (res.code !== 0) throw new Error(res.msg || "重置失败")
    setOAuthCredentialFlash(props.app.oauthId, res.result?.oauthSecret ?? "")
    ElMessage.success("新密钥已生成")
  } catch (err) {
    ElMessage.error(errorMessage(err, "重置失败"))
  } finally {
    resetting.value = false
  }
}
</script>

<style scoped lang="less">
.dv-subtitle {
  margin: 0 0 var(--ds-space-4);
  font-size: var(--ds-fs-14);
  font-weight: var(--ds-weight-medium);
  color: var(--ds-neutral-900);
}
</style>
