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

  开发者选项：只展示推送机器人接入所需的四个值 —— Bot ID / Webhook URL / Token / 签名密钥。
  Webhook URL 里的 token 在详情接口里被脱敏成 ***，token 本身只存哈希、事后无法重建，
  所以真正的完整地址与 token 只在创建时返回一次（credentialFlash），其余时候显示「未持有」。
-->

<template>
  <div>
    <FormCard title="推送机器人开放能力">
      <h4 class="dv-subtitle">机器人密钥</h4>

      <div class="ds-summary">
        <span class="ds-summary__key">Bot ID</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ bot.botId }}</code>
          <el-button link type="primary" @click="copyText(bot.botId, 'Bot ID 已复制')">复制</el-button>
        </span>

        <span class="ds-summary__key">Webhook URL</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ webhookText }}</code>
          <el-button
            v-if="flashVisible"
            link
            type="primary"
            @click="copyText(webhookText, 'Webhook URL 已复制')"
          >
            复制
          </el-button>
        </span>

        <span class="ds-summary__key">Token</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ tokenText }}</code>
          <el-button
            v-if="flashVisible"
            link
            type="primary"
            @click="copyText(tokenText, 'Token 已复制')"
          >
            复制
          </el-button>
        </span>

        <span class="ds-summary__key">签名密钥</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ secretText }}</code>
          <el-button
            v-if="flashVisible"
            link
            type="primary"
            @click="copyText(secretText, '签名密钥已复制')"
          >
            复制
          </el-button>
          <el-button v-if="flashVisible" link @click="dismiss">我已保存</el-button>
        </span>
      </div>

      <template #footer>
        <el-button type="danger" plain :loading="resetting" @click="resetSecret">
          重置签名密钥
        </el-button>
      </template>
    </FormCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { resetBotSecretApi } from "@/api/bot"
import type { IBotInfo } from "@/types/api/bot"
import FormCard from "@/pages/digitals/components/FormCard.vue"
import {
  botCredentialFlash,
  clearBotCredentialFlash,
  setBotCredentialFlash
} from "@/pages/bots/credentialFlash"

const props = defineProps<{ bot: IBotInfo }>()

const resetting = ref(false)

const flashVisible = computed(
  () => !!botCredentialFlash.botId && botCredentialFlash.botId === props.bot.botId
)

const webhookText = computed(() =>
  flashVisible.value && botCredentialFlash.webhookUrl
    ? botCredentialFlash.webhookUrl
    : props.bot.webhookUrl || "—"
)
const tokenText = computed(() =>
  flashVisible.value && botCredentialFlash.token ? botCredentialFlash.token : "未持有"
)
const secretText = computed(() =>
  flashVisible.value && botCredentialFlash.secret ? botCredentialFlash.secret : "未持有"
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

/** 收起明文：只清掉这次展示的凭据，不影响已落库的配置。 */
function dismiss() {
  clearBotCredentialFlash()
}

async function resetSecret() {
  try {
    await ElMessageBox.confirm(
      "旧签名密钥立即失效，正在用它加签的服务会立刻推送失败。确认换发？",
      "重置签名密钥",
      { type: "warning", confirmButtonText: "确认换发", cancelButtonText: "取消" }
    )
  } catch {
    return
  }
  resetting.value = true
  try {
    const res = await resetBotSecretApi({ botId: props.bot.botId })
    if (res.code !== 0) throw new Error(res.msg || "重置失败")
    // 重置只换签名密钥，Webhook URL 与 Token 不变：原本持有时继续展示，否则留空。
    setBotCredentialFlash(props.bot.botId, {
      webhookUrl: flashVisible.value ? botCredentialFlash.webhookUrl : "",
      token: flashVisible.value ? botCredentialFlash.token : "",
      secret: res.result?.secret ?? ""
    })
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
