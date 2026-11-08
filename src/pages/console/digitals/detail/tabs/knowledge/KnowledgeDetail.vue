<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  beaver-open-header-v1

  知识源条目子界面：返回栏 + 左导航（文档 / 召回测试 / 设置），结构对齐 cloud-console 的 KsDetailView。
-->

<script setup lang="ts">
import { ref } from "vue"
import type { IDigitalKnowledge } from "@/types/api/digital"
import KnowledgeDocsPanel from "./KnowledgeDocsPanel.vue"
import KnowledgeRetrievePanel from "./KnowledgeRetrievePanel.vue"
import KnowledgeSettingsPanel from "./KnowledgeSettingsPanel.vue"

const props = defineProps<{
  digitalId: string
  collection: IDigitalKnowledge
}>()

const emit = defineEmits<{
  back: []
  refresh: []
}>()

const activeTab = ref<"docs" | "retrieve" | "settings">("docs")

const tabs = [
  { id: "docs" as const, label: "文档" },
  { id: "retrieve" as const, label: "召回测试" },
  { id: "settings" as const, label: "设置" }
]
</script>

<template>
  <div class="ks-detail">
    <div class="ks-detail__bar">
      <el-button link type="primary" class="ks-detail__back" @click="emit('back')">
        ← 全部知识源
      </el-button>
      <span class="ks-detail__name">{{ props.collection.name }}</span>
      <span v-if="props.collection.bound" class="ks-detail__badge">已绑定本数字伙伴</span>
    </div>

    <div class="ks-layout">
      <nav class="ks-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="ks-nav__item"
          :class="{ 'ks-nav__item--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div class="ks-panel">
        <KnowledgeDocsPanel
          v-if="activeTab === 'docs'"
          :digital-id="props.digitalId"
          :collection-id="props.collection.collectionId"
          @changed="emit('refresh')"
        />
        <KnowledgeRetrievePanel
          v-else-if="activeTab === 'retrieve'"
          :digital-id="props.digitalId"
          :collection-id="props.collection.collectionId"
          :top-k="props.collection.topK"
        />
        <KnowledgeSettingsPanel
          v-else
          :digital-id="props.digitalId"
          :collection="props.collection"
          @changed="emit('refresh')"
          @removed="emit('back'); emit('refresh')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.ks-detail {
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
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__badge {
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}

.ks-layout {
  display: flex;
  min-height: 420px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
}

.ks-nav {
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

.ks-panel {
  flex: 1;
  min-width: 0;
  padding: 16px;
}
</style>
