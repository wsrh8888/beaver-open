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

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import { getOAuthAppDetailApi } from "@/api/oauth"
import type { IOAuthAppInfo } from "@/types/api/oauth"
import PageHeader from "../../_shared/PageHeader.vue"
import TabNav from "../../_shared/TabNav.vue"
import { useTabNav } from "../../_shared/console"
import OverviewTab from "./tabs/OverviewTab.vue"
import CredentialsTab from "./tabs/CredentialsTab.vue"
import ScopesTab from "./tabs/ScopesTab.vue"
import PlatformsTab from "./tabs/PlatformsTab.vue"

const route = useRoute()
const oauthId = computed(() => String(route.params.oauthId || ""))
const loading = ref(false)
const loadFailed = ref(false)
const app = ref<IOAuthAppInfo | null>(null)

const tabs = [
  { key: "overview", label: "概览" },
  { key: "credentials", label: "凭证" },
  { key: "scopes", label: "权限范围" },
  { key: "platforms", label: "端配置" }
]
const { active, select } = useTabNav(tabs, "overview")

const loadDetail = async () => {
  if (!oauthId.value) {
    loadFailed.value = true
    return
  }
  loading.value = true
  loadFailed.value = false
  try {
    const res = await getOAuthAppDetailApi({ oauthId: oauthId.value })
    const info = res?.result?.app
    if (!info) throw new Error("应用不存在")
    app.value = info
    route.meta.entityName = info.name
    document.title = `${info.name} · Beaver 开放平台`
  } catch (err) {
    loadFailed.value = true
    ElMessage.error((err as Error)?.message || "加载应用详情失败")
  } finally {
    loading.value = false
  }
}

const refresh = async () => { await loadDetail() }

// 详情页组件在 :oauthId 变化时会复用，必须重新拉取，避免显示上一个应用的数据。
watch(oauthId, (id, previous) => {
  if (id && id !== previous) {
    route.meta.entityName = undefined
    loadDetail()
  }
})

onMounted(loadDetail)
</script>

<template>
  <div>
    <PageHeader
      :title="app?.name || (loadFailed ? '应用不可用' : '应用详情')"
      desc="管理应用信息、凭证、权限范围与各端接入配置。"
      back-to="/console/oauth"
      back-label="返回应用列表"
      :badge="app ? (app.status === 1 ? '启用' : '禁用') : undefined"
      :badge-tone="app?.status === 1 ? 'success' : 'neutral'"
      :loading="loading"
    />

    <div v-if="loadFailed" class="ds-notice ds-notice--danger">
      无法加载该应用，请返回列表后重试。
    </div>

    <template v-if="app">
      <TabNav :tabs="tabs" :active="active" @select="select" />

      <!-- :key 随实体 ID 变化，强制重建分区组件，避免复用时残留上一个实体的表单状态 -->
      <div :key="oauthId">
        <OverviewTab v-if="active === 'overview'" :app="app" @refresh="refresh" />
        <CredentialsTab v-else-if="active === 'credentials'" :app="app" @refresh="refresh" />
        <ScopesTab v-else-if="active === 'scopes'" :oauth-id="app.oauthId" />
        <PlatformsTab v-else-if="active === 'platforms'" :oauth-id="app.oauthId" />
      </div>
    </template>
  </div>
</template>
