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

  开发者选项：只展示数字伙伴开放能力下的三个值 —— 机器人 ID / AppKey / AppSecret。
  机器人 ID 就是 OpenDigital.DigitalID，它本身就是这个数字伙伴的 UserModel.UserID，
  没有独立的 robot_id 列，所以这里直接展示 digitalId。
  AppSecret 明文只在创建 / 重置时返回一次（credentialFlash），其余时候是掩码。
-->

<template>
  <div>
    <FormCard title="数字伙伴开放能力">
      <h4 class="dv-subtitle">
        数字伙伴密钥
      </h4>

      <div class="ds-summary">
        <span class="ds-summary__key">机器人 ID</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ digitalId || "—" }}</code>
          <el-button
            v-if="digitalId"
            link
            type="primary"
            @click="copyText(digitalId, '机器人 ID 已复制')"
          >
            复制
          </el-button>
        </span>

        <span class="ds-summary__key">AppKey</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ appKeyText }}</code>
          <el-button
            v-if="appKeyText !== '—'"
            link
            type="primary"
            @click="copyText(appKeyText, 'AppKey 已复制')"
          >
            复制
          </el-button>
        </span>

        <span class="ds-summary__key">AppSecret</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ appSecretText }}</code>
          <el-button
            v-if="flashVisible"
            link
            type="primary"
            @click="copyText(appSecretText, 'AppSecret 已复制')"
          >
            复制
          </el-button>
          <el-button v-if="flashVisible" link @click="clearCredentialFlash">
            我已保存
          </el-button>
        </span>
      </div>

      <template #footer>
        <el-button type="danger" plain :loading="resetting" @click="resetSecret">
          重置 AppSecret
        </el-button>
      </template>
    </FormCard>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { resetDigitalSecretApi } from "@/api/digital"
import FormCard from "@/pages/digitals/components/FormCard.vue"
import { useDigitalWorkspace } from "../workspace"
import { clearCredentialFlash, credentialFlash, setCredentialFlash } from "../credentialFlash"

const ws = useDigitalWorkspace()
const digitalId = ws.digitalId
const digital = ws.digital

const resetting = ref(false)

const flashVisible = computed(
  () => !!credentialFlash.appSecret && credentialFlash.digitalId === digitalId.value
)
const appKeyText = computed(() => {
  if (flashVisible.value && credentialFlash.appKey) return credentialFlash.appKey
  return digital.value?.appKey || "—"
})
const appSecretText = computed(() => {
  if (flashVisible.value) return credentialFlash.appSecret
  return digital.value?.appSecret || "—"
})

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

async function resetSecret() {
  try {
    await ElMessageBox.confirm("旧 AppSecret 立即失效，确认换发？", "重置 AppSecret", {
      type: "warning",
      confirmButtonText: "确认换发",
      cancelButtonText: "取消"
    })
  } catch {
    return
  }
  resetting.value = true
  try {
    const res = await resetDigitalSecretApi({ digitalId: digitalId.value })
    if (res.code !== 0) throw new Error(res.msg || "重置失败")
    setCredentialFlash(digitalId.value, {
      appKey: digital.value?.appKey ?? "",
      appSecret: res.result?.appSecret ?? "",
      reason: "reset"
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
