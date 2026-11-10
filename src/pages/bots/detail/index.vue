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
    <PageHeader
      :title="bot?.name || (loadFailed ? '机器人不可用' : '机器人详情')"
      desc="通过 Incoming Webhook 向群内推送通知，配置接入信息与成员。"
      back-to="/bots"
      back-label="返回机器人列表"
      :badge="bot ? visibilityText(bot.visibility) : undefined"
      :loading="loading"
    />

    <div v-if="loadFailed" class="ds-notice ds-notice--danger">
      无法加载该机器人，请返回列表后重试。
    </div>

    <template v-if="bot">
      <TabNav :tabs="tabs" :active="active" @select="select" />

      <!-- :key 随实体 ID 变化，强制重建分区组件，避免复用时残留上一个实体的表单状态 -->
      <div :key="botId">
        <OverviewTab v-if="active === 'overview'" :bot="bot" @refresh="refresh" />
        <WebhookTab v-else-if="active === 'webhook'" :bot="bot" />
        <MembersTab v-else-if="active === 'members'" :bot="bot" @refresh="refresh" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref, watch, defineComponent } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { getBotDetailApi } from "@/api/bot"
import type { IBotInfo } from "@/types/api/bot"
import PageHeader from "@/pages/bots/components/PageHeader.vue"
import TabNav from "@/pages/bots/components/TabNav.vue"
import OverviewTab from "./tabs/OverviewTab.vue"
import WebhookTab from "./tabs/WebhookTab.vue"
import MembersTab from "./tabs/MembersTab.vue"

export default defineComponent({
  name: "BotsDetailPage",
  setup() {
    /** 分区与 URL ?tab= 双向同步：刷新、分享、浏览器后退都停在同一分区。本页自己用，不抽公共 composable。 */
    function useTabNav(tabs: { key: string; label: string }[], defaultKey?: string) {
      const tabRoute = useRoute()
      const tabRouter = useRouter()
      const fallback = defaultKey || tabs[0]?.key || ""
      const active = computed(() => {
        const queryTab = String(tabRoute.query.tab || "")
        return tabs.some(item => item.key === queryTab) ? queryTab : fallback
      })
      const select = (key: string) => {
        if (key === active.value) return
        tabRouter.replace({ query: { ...tabRoute.query, tab: key } })
      }
      return { active, select }
    }

    function visibilityText(value?: string): string {
      if (value === "public") return "公开"
      if (value === "partial") return "指定成员"
      return "私有"
    }

    const route = useRoute()
    const botId = computed(() => String(route.params.botId || ""))
    const loading = ref(false)
    const loadFailed = ref(false)
    const bot = ref<IBotInfo | null>(null)

    const tabs = [
      { key: "overview", label: "概览" },
      { key: "webhook", label: "接入信息" },
      { key: "members", label: "成员与可见性" }
    ]
    const { active, select } = useTabNav(tabs, "overview")

    const loadDetail = async () => {
      if (!botId.value) {
        loadFailed.value = true
        return
      }
      loading.value = true
      loadFailed.value = false
      try {
        const res = await getBotDetailApi({ botId: botId.value })
        const info = res?.result?.bot
        if (!info) throw new Error("机器人不存在")
        bot.value = info
        route.meta.entityName = info.name
        document.title = `${info.name} · Beaver 开放平台`
      } catch (err) {
        loadFailed.value = true
        ElMessage.error((err as Error)?.message || "加载机器人详情失败")
      } finally {
        loading.value = false
      }
    }

    const refresh = async () => { await loadDetail() }

    // 详情页组件在 :botId 变化时会复用，必须重新拉取，避免显示上一个机器人的数据。
    watch(botId, (id, previous) => {
      if (id && id !== previous) {
        route.meta.entityName = undefined
        loadDetail()
      }
    })

    onMounted(loadDetail)
    return {
      useTabNav, visibilityText, route, botId, loading, loadFailed, bot, tabs, active, select,
      loadDetail, refresh, computed, onMounted, ref, watch, useRoute, useRouter, ElMessage,
      getBotDetailApi, PageHeader, TabNav, OverviewTab, WebhookTab, MembersTab
    }
  }
})
</script>
