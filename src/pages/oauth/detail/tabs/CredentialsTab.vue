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
-->

<template>
  <div>
    <FormCard title="应用凭证" desc="OAuth ID 可公开，OAuthSecret 只应保存在你的服务端。">
      <div class="ds-summary">
        <span class="ds-summary__key">OAuth ID</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ app.oauthId }}</code>
          <el-button link type="primary" @click="copyText(app.oauthId, 'OAuth ID 已复制')">复制</el-button>
        </span>
        <span class="ds-summary__key">OAuthSecret</span>
        <span class="ds-summary__val ds-mono">{{ app.oauthSecret || "—" }}</span>
      </div>
      <div class="ds-notice" style="margin-top: var(--ds-space-5)">
        <span>服务端只保存密钥哈希，列表与详情返回掩码。明文只在创建或重置时返回一次；忘记密钥请换发一把新的。</span>
      </div>
      <template #footer>
        <el-button type="danger" plain :loading="resetting" @click="resetSecret">重置密钥</el-button>
      </template>
    </FormCard>

    <FormCard v-if="newSecret" title="新的 OAuthSecret" desc="请立即复制保存，收起后将无法再次查看。">
      <CredentialPanel
        :items="revealItems"
        notice="旧密钥已失效。新 OAuthSecret 只在这里明文显示一次，请立即复制并更新到你的服务配置。"
      >
        <template #footer>
          <el-button type="primary" @click="dismiss">我已保存，收起</el-button>
        </template>
      </CredentialPanel>
    </FormCard>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { computed, ref, defineComponent, toRefs } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { resetOAuthSecretApi } from "@/api/oauth"
import type { IOAuthAppInfo } from "@/types/api/oauth"
import FormCard from "@/pages/oauth/components/FormCard.vue"
import CredentialPanel from "@/pages/oauth/components/CredentialPanel.vue"

export default defineComponent({
  name: "CredentialsTab",
  components: { FormCard, CredentialPanel },
  props: {
    app: { type: Object as PropType<IOAuthAppInfo>, required: true }
  },
  emits: ["refresh"],
  setup(props, { emit }) {
    async function copyText(text: string, label = "已复制"): Promise<void> {
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

    const resetting = ref(false)
    const newSecret = ref("")
    const revealItems = computed(() => [
      { label: "OAuthSecret", value: newSecret.value, hint: "新密钥，仅此处明文显示一次" }
    ])

    const resetSecret = () => {
      ElMessageBox.confirm(
        "旧 OAuthSecret 立即失效，正在使用它的服务会立刻鉴权失败。确认换发？",
        "重置应用密钥",
        { type: "warning", confirmButtonText: "确认换发", cancelButtonText: "取消" }
      )
        .then(async () => {
          resetting.value = true
          try {
            const res = await resetOAuthSecretApi({ oauthId: props.app.oauthId })
            if (res.code !== 0) throw new Error(res.msg || "重置失败")
            newSecret.value = res.result?.oauthSecret ?? ""
            emit("refresh")
          } catch (err) {
            ElMessage.error(errorMessage(err, "重置失败"))
          } finally {
            resetting.value = false
          }
        })
        .catch(() => undefined)
    }

    const dismiss = () => { newSecret.value = "" }
    return {
      ...toRefs(props), props, emit, copyText, errorMessage, resetting, newSecret,
      revealItems, resetSecret, dismiss, computed, ref, ElMessage, ElMessageBox,
      resetOAuthSecretApi, FormCard, CredentialPanel
    }
  }
})
</script>
