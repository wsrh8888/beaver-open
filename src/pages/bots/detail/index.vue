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

  推送机器人详情：只有「设置」和「开发者选项」两个分区，与智能体详情同一套骨架。
  接入信息属于开发者视角（凭据、Webhook），归到开发者选项；其余（名称、头像、描述、
  可见范围、人员）都是产品配置，归到设置。
-->

<template>
  <div class="ws">
    <header class="ws-head">
      <button class="ws-back" type="button" @click="goList">
        <el-icon><ArrowLeft /></el-icon>返回列表
      </button>

      <div class="ws-head__row">
        <h1 class="ws-title">{{ bot?.name || (loadFailed ? "机器人不可用" : "推送机器人") }}</h1>
      </div>
    </header>

    <TabNav :tabs="tabs" :active="active" @select="select" />

    <div v-if="loadFailed" class="ds-notice ds-notice--danger">
      无法加载该机器人，请返回列表后重试。
    </div>

    <template v-else-if="bot">
      <!-- :key 随实体 ID 变化，强制重建分区组件，避免复用时残留上一个实体的表单状态 -->
      <div :key="botId" v-loading="loading">
        <SettingsTab v-if="active === 'settings'" :bot="bot" @refresh="loadDetail" />
        <DeveloperTab v-else-if="active === 'developer'" :bot="bot" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { ArrowLeft } from "@element-plus/icons-vue"
import { getBotDetailApi } from "@/api/bot"
import type { IBotInfo } from "@/types/api/bot"
import TabNav from "@/pages/digitals/components/TabNav.vue"
import SettingsTab from "./tabs/SettingsTab.vue"
import DeveloperTab from "./tabs/DeveloperTab.vue"

const route = useRoute()
const router = useRouter()

const botId = computed(() => String(route.params.botId || ""))
const loading = ref(false)
const loadFailed = ref(false)
const bot = ref<IBotInfo | null>(null)

const tabs = [
  { key: "settings", label: "设置" },
  { key: "developer", label: "开发者选项" }
]

/** 分区与 URL ?tab= 同步：刷新、分享、浏览器后退都停在同一分区。 */
const active = computed(() => {
  const queryTab = String(route.query.tab || "")
  return tabs.some(item => item.key === queryTab) ? queryTab : "settings"
})

const select = (key: string) => {
  if (key === active.value) return
  router.replace({ query: { ...route.query, tab: key } })
}

const goList = () => router.push("/bots")

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

async function loadDetail() {
  const id = botId.value
  if (!id) {
    loadFailed.value = true
    return
  }
  loading.value = true
  loadFailed.value = false
  try {
    const res = await getBotDetailApi({ botId: id })
    const info = res?.result?.bot
    if (!info) throw new Error("机器人不存在")
    bot.value = info
    route.meta.entityName = info.name
  } catch (err) {
    loadFailed.value = true
    ElMessage.error(errorMessage(err, "加载机器人详情失败"))
  } finally {
    loading.value = false
  }
}

// 详情页组件在 :botId 变化时会复用，必须重新拉取，避免显示上一个机器人的数据。
watch(botId, (id, previous) => {
  if (id && id !== previous) loadDetail()
})

onMounted(loadDetail)
</script>

<style lang="less" scoped>
.ws-head { margin-bottom: var(--ds-space-4); }

.ws-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ds-neutral-600);
  font-family: inherit;
  font-size: var(--ds-fs-13);
  cursor: pointer;

  &:hover { color: var(--ds-brand); }
}

.ws-head__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ds-space-4);
  margin-top: var(--ds-space-2);
}

.ws-title {
  font-size: var(--ds-fs-20);
  font-weight: var(--ds-weight-bold);
  line-height: var(--ds-lh-heading);
  color: var(--ds-neutral-900);
  word-break: break-all;
}
</style>
