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
    <FormCard title="Webhook 地址" desc="向这个地址发起请求即可向群内推送通知。">
      <div class="ds-summary">
        <span class="ds-summary__key">Webhook URL</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ bot.webhookUrl || "—" }}</code>
          <el-button
            v-if="bot.webhookUrl"
            link
            type="primary"
            @click="copyText(bot.webhookUrl, 'Webhook URL 已复制')"
          >复制</el-button>
        </span>
      </div>
      <div class="ds-notice" style="margin-top: var(--ds-space-5)">
        <span>消息体格式、加签算法与频率限制以接入文档为准。请把地址当作 confidential 信息保管，不要在公开仓库里硬编码。</span>
      </div>
    </FormCard>

    <FormCard title="调用凭据" desc="Token 与签名密钥只在创建或重置时明文返回一次。">
      <div class="ds-notice ds-notice--brand">
        <span>服务端只保存哈希，详情接口不返回明文。忘记密钥时请换发新的，旧密钥会立即失效。</span>
      </div>
      <template #footer>
        <el-button type="danger" plain :loading="resetting" @click="resetSecret">重置签名密钥</el-button>
      </template>
    </FormCard>

    <FormCard v-if="newSecret" title="新的签名密钥" desc="请立即复制保存，收起后将无法再次查看。">
      <CredentialPanel
        :items="revealItems"
        notice="旧密钥已失效。新签名密钥只在这里明文显示一次，请立即复制并更新到你的服务配置。"
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
import { resetBotSecretApi } from "@/api/bot"
import type { IBotInfo } from "@/types/api/bot"
import FormCard from "@/pages/bots/components/FormCard.vue"
import CredentialPanel from "@/pages/bots/components/CredentialPanel.vue"

export default defineComponent({
  name: "WebhookTab",
  components: { FormCard, CredentialPanel },
  props: {
    bot: { type: Object as PropType<IBotInfo>, required: true }
  },
  setup(props) {
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
      { label: "签名密钥", value: newSecret.value, hint: "新密钥，仅此处明文显示一次" }
    ])

    const resetSecret = () => {
      ElMessageBox.confirm(
        "旧签名密钥立即失效，正在用它加签的服务会立刻推送失败。确认换发？",
        "重置签名密钥",
        { type: "warning", confirmButtonText: "确认换发", cancelButtonText: "取消" }
      )
        .then(async () => {
          resetting.value = true
          try {
            const res = await resetBotSecretApi({ botId: props.bot.botId })
            if (res.code !== 0) throw new Error(res.msg || "重置失败")
            newSecret.value = res.result?.secret ?? ""
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
      ...toRefs(props), props, copyText, errorMessage, resetting, newSecret, revealItems,
      resetSecret, dismiss, computed, ref, ElMessage, ElMessageBox, resetBotSecretApi,
      FormCard, CredentialPanel
    }
  }
})
</script>
