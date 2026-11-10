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

  知识库详情：平台级资产的「文档 / 召回测试 / 设置」三个分区。
  这里没有 digitalId，也不存在「绑定到本智能体」——引用关系由智能体侧的知识源维护。
-->

<template>
  <div v-loading="loading" class="kb-detail">
    <div class="kb-detail__bar">
      <el-button link type="primary" class="kb-detail__back" @click="goBack">← 全部知识库</el-button>
      <span class="kb-detail__name">{{ collection?.name || "知识库详情" }}</span>
      <span v-if="collection" class="kb-detail__tag" :class="{ 'is-off': collection.status !== 1 }">
        {{ collection.status === 1 ? "启用中" : "已停用" }}
      </span>
      <span v-if="collection" class="kb-detail__id">{{ collection.collectionId }}</span>
    </div>

    <div v-if="collection" class="kb-layout">
      <nav class="kb-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="kb-nav__item"
          :class="{ 'kb-nav__item--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="kb-panel">
        <KnowledgeDocsPanel
          v-if="activeTab === 'docs'"
          :collection-id="collection.collectionId"
          @changed="load"
        />
        <KnowledgeRetrievePanel
          v-else-if="activeTab === 'retrieve'"
          :collection-id="collection.collectionId"
          :top-k="collection.topK"
        />
        <KnowledgeSettingsPanel
          v-else
          :collection="collection"
          @changed="load"
          @removed="goBack"
        />
      </div>
    </div>

    <div v-else-if="!loading" class="kb-missing">
      <el-button type="primary" @click="goBack">返回知识库列表</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref, defineComponent } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { listKnowledgeBaseApi } from "@/api/knowledge"
import type { IKnowledgeBase } from "@/types/api/knowledge"
import KnowledgeDocsPanel from "./panels/KnowledgeDocsPanel.vue"
import KnowledgeRetrievePanel from "./panels/KnowledgeRetrievePanel.vue"
import KnowledgeSettingsPanel from "./panels/KnowledgeSettingsPanel.vue"

export default defineComponent({
  name: "KnowledgeDetailPage",
  setup() {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const route = useRoute()
    const router = useRouter()
    const collectionId = computed(() => String(route.params.collectionId || ""))

    const collection = ref<IKnowledgeBase | null>(null)
    const loading = ref(false)
    const activeTab = ref<"docs" | "retrieve" | "settings">("docs")

    const tabs = [
      { id: "docs" as const, label: "文档" },
      { id: "retrieve" as const, label: "召回测试" },
      { id: "settings" as const, label: "设置" }
    ]

    const load = async () => {
      if (!collectionId.value) return
      loading.value = true
      try {
        const res = await listKnowledgeBaseApi()
        if (res.code !== 0) throw new Error(res.msg || "加载知识库失败")
        collection.value = (res.result?.list ?? []).find(
          item => item.collectionId === collectionId.value
        ) ?? null
        if (!collection.value) ElMessage.warning("知识库不存在或已被删除")
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载知识库失败"))
      } finally {
        loading.value = false
      }
    }

    const goBack = () => router.push("/knowledge")

    onMounted(load)
    return {
      errorMessage, route, router, collectionId, collection, loading, activeTab, tabs, load,
      goBack, computed, onMounted, ref, useRoute, useRouter, ElMessage, listKnowledgeBaseApi,
      KnowledgeDocsPanel, KnowledgeRetrievePanel, KnowledgeSettingsPanel
    }
  }
})
</script>

<style scoped lang="less">
.kb-detail {
  &__bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__back {
    font-size: 14px;
    padding-left: 0;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__tag {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);

    &.is-off {
      color: var(--el-text-color-secondary);
      background: var(--el-fill-color);
    }
  }

  &__id {
    margin-left: auto;
    font-size: 12px;
    font-family: ui-monospace, monospace;
    color: var(--el-text-color-secondary);
  }
}

.kb-layout {
  display: flex;
  min-height: 420px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.kb-nav {
  width: 132px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
  background: var(--el-fill-color-lighter);
  border-right: 1px solid var(--el-border-color-lighter);

  &__item {
    border: none;
    background: transparent;
    text-align: left;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    color: var(--el-text-color-regular);

    &:hover:not(&--active) {
      color: var(--el-color-primary);
    }

    &--active {
      background: var(--el-bg-color);
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }
}

.kb-panel {
  flex: 1;
  min-width: 0;
  padding: 16px;
}

.kb-missing {
  padding: 40px;
  text-align: center;
}
</style>
