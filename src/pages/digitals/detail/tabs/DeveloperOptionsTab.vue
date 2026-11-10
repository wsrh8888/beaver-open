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
    <div v-if="isNew" class="ds-notice ds-notice--brand">
      <span>
        草稿还没有实体 ID 与凭据。创建智能体后，这里会展示 Digital ID；
        若选择「长链接接入」，AppKey / AppSecret 明文也只在这里显示一次。
      </span>
    </div>

    <template v-else-if="isLongConnect">
      <FormCard title="长期凭据" desc="用 AppKey / AppSecret 换取短时 access_token 后建立长连接。">
        <div class="ds-summary">
          <span class="ds-summary__key">Digital ID</span>
          <span class="ds-summary__val">
            <code class="ds-mono">{{ digitalId }}</code>
            <el-button link type="primary" @click="copyText(digitalId, 'Digital ID 已复制')">复制</el-button>
          </span>
          <span class="ds-summary__key">AppKey</span>
          <span class="ds-summary__val">
            <code class="ds-mono">{{ digital?.appKey || "—" }}</code>
            <el-button
              v-if="digital?.appKey"
              link
              type="primary"
              @click="copyText(digital?.appKey || '', 'AppKey 已复制')"
            >复制</el-button>
          </span>
          <span class="ds-summary__key">AppSecret</span>
          <span class="ds-summary__val ds-mono">{{ digital?.appSecret || "—" }}</span>
        </div>
        <div class="ds-notice" style="margin-top: var(--ds-space-5)">
          <span>服务端只保存密钥哈希，详情接口返回掩码。明文只在创建或重置时返回一次；忘记密钥请换发一把新的。</span>
        </div>
        <template #footer>
          <el-button type="danger" plain :loading="resetting" @click="resetSecret">重置 AppSecret</el-button>
        </template>
      </FormCard>

      <FormCard
        v-if="flashVisible"
        title="一次性凭据"
        desc="请立即复制保存，收起后将无法再次查看。"
      >
        <CredentialPanel
          :items="flashItems"
          :notice="credentialFlash.reason === 'reset'
            ? '旧密钥已失效。新 AppSecret 只在这里明文显示一次，请立即更新到你的服务配置。'
            : 'AppSecret 只在这里明文显示一次，服务端只保存哈希；离开后只能换发。'"
        >
          <template #footer>
            <el-button type="primary" @click="clearCredentialFlash">我已保存，收起</el-button>
          </template>
        </CredentialPanel>
      </FormCard>

      <FormCard title="接入说明" desc="平台在长链接模式下提供的全部内容。">
        <ul class="access-list">
          <li>平台签发 AppKey / AppSecret，用于换取短时 access_token。</li>
          <li>智能体的模型、提示词、工具与流程全部由你的服务实现，平台不托管运行时。</li>
          <li>可见范围与成员在「设置」分区维护。</li>
        </ul>
      </FormCard>
    </template>

    <template v-else>
      <FormCard title="无需长期凭据" desc="提示词编排由平台托管运行，凭据在平台内部管理。">
        <div class="ds-notice ds-notice--brand">
          <span>这个智能体走平台自有运行时，不签发 AppKey / AppSecret。你需要维护的是「编排」「知识源」「工具」三个分区。</span>
        </div>
        <div class="ds-summary" style="margin-top: var(--ds-space-5)">
          <span class="ds-summary__key">Digital ID</span>
          <span class="ds-summary__val">
            <code class="ds-mono">{{ digitalId }}</code>
            <el-button link type="primary" @click="copyText(digitalId, 'Digital ID 已复制')">复制</el-button>
          </span>
        </div>
        <template #footer>
          <el-button @click="ws.goTab('settings')">前往「设置」配置可见范围</el-button>
        </template>
      </FormCard>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, ref, defineComponent } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { resetDigitalSecretApi } from "@/api/digital"
import { useDigitalWorkspace } from "../workspace"
import FormCard from "@/pages/digitals/components/FormCard.vue"
import CredentialPanel from "@/pages/digitals/components/CredentialPanel.vue"
import {
  clearCredentialFlash,
  credentialFlash,
  setCredentialFlash
} from "../credentialFlash"

export default defineComponent({
  name: "DeveloperOptionsTab",
  setup() {
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

    const ws = useDigitalWorkspace()
    const { isNew, mode, digital, digitalId } = ws
    const resetting = ref(false)

    const isLongConnect = computed(() => mode.value === "longconnect")
    const flashVisible = computed(() =>
      !!credentialFlash.appSecret && credentialFlash.digitalId === digitalId.value
    )
    const flashItems = computed(() => {
      const items = [
        { label: "Digital ID", value: digitalId.value, hint: "智能体的唯一标识" },
        { label: "AppKey", value: credentialFlash.appKey, hint: "长连接鉴权用的客户端 ID" },
        { label: "AppSecret", value: credentialFlash.appSecret, hint: "仅此一次明文可见" }
      ]
      return items.filter(item => item.value)
    })

    const resetSecret = () => {
      ElMessageBox.confirm(
        "旧 AppSecret 立即失效，正在使用它的服务会立刻鉴权失败。确认换发？",
        "重置 AppSecret",
        { type: "warning", confirmButtonText: "确认换发", cancelButtonText: "取消" }
      )
        .then(async () => {
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
        })
        .catch(() => undefined)
    }
    return {
      copyText, errorMessage, ws, isNew, mode, digital, digitalId, resetting, isLongConnect,
      flashVisible, flashItems, resetSecret, computed, ref, ElMessage, ElMessageBox,
      resetDigitalSecretApi, useDigitalWorkspace, FormCard, CredentialPanel,
      clearCredentialFlash, credentialFlash, setCredentialFlash
    }
  }
})
</script>

<style lang="less" scoped>
.access-list {
  list-style: none;
  font-size: var(--ds-fs-14);
  line-height: 26px;
  color: var(--ds-neutral-700);

  li {
    position: relative;
    padding-left: var(--ds-space-4);

    &::before {
      content: "";
      position: absolute;
      left: 2px;
      top: 11px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--ds-neutral-300);
    }
  }
}
</style>
