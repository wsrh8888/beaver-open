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

  知识源分区（列表）：知识源 ≠ 知识库。
  知识源是 open_knowledge_source 表里的后端一等实体，归当前数字伙伴所有，只持有 platform 索引集合的引用。
  - 点「创建知识源」进入独立子路由 /digitals/:digitalId/knowledge/create（先选数据源再落库，不在列表页弹输入框）；
  - 点卡片进入 /digitals/:digitalId/knowledge/:knowledgeSourceId。
  本组件只负责列表与入口。
-->

<template>
  <div>
    <div v-if="mode !== 'prompt'" class="ds-notice ds-notice--brand">
      <span>
        当前是{{ mode === 'longconnect' ? '长链接接入' : '工作流编排' }}。知识源由平台运行时检索，只在提示词编排下生效；
        切回「提示词编排」即可在这里配置。
      </span>
    </div>

    <!-- 草稿态：后端实体必须挂在已落库的 digitalId 上，先创建智能体 -->
    <div v-if="needsSave" class="ks-draft">
      <span>知识源是保存在智能体下的独立实体，请先把这个智能体保存下来。</span>
      <el-button type="primary" size="small" :loading="creating" @click="createDigitalFirst">
        保存并继续
      </el-button>
    </div>

    <div class="ks-head">
      <h3 class="ks-head__title">知识源</h3>
      <el-button
        type="primary"
        :icon="Plus"
        :disabled="mode !== 'prompt' || needsSave"
        @click="goCreate"
      >
        创建知识源
      </el-button>
    </div>

    <div v-loading="loading" class="agent-tools">
      <div class="tool-grid">
        <button
          type="button"
          class="tool-card tool-card--entry"
          :disabled="mode !== 'prompt' || needsSave"
          @click="goCreate"
        >
          <div class="tool-card__body tool-card__body--entry">
            <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
            <span class="tool-card__entry-label">创建知识源</span>
            <span class="tool-card__entry-hint">组合多份在线文档或本地文件供智能体检索</span>
          </div>
        </button>

        <button
          v-for="source in sources"
          :key="source.knowledgeSourceId"
          type="button"
          class="tool-card"
          @click="openSource(source.knowledgeSourceId)"
        >
          <div class="tool-card__body">
            <div class="tool-card__row">
              <span class="tool-card__icon" :style="{ background: iconTint(source.name) }">
                {{ iconLetter(source.name) }}
              </span>
              <div class="tool-card__text">
                <span class="tool-card__title">{{ source.name }}</span>
                <span class="tool-card__subtitle">
                  {{ source.documentCount }} 篇文档 · 检索 TopK {{ source.retrievalTopK || 8 }}
                </span>
              </div>
            </div>
            <p class="tool-card__desc">{{ sourceSummary(source) }}</p>
          </div>
          <div class="tool-card__foot ks-foot">
            <span class="tool-card__tag">知识源</span>
            <span class="ks-foot__action">管理 →</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { listKnowledgeSourceApi } from "@/api/knowledge"
import type { IKnowledgeSourceItem } from "@/types/api/knowledge"
import { useDigitalWorkspace } from "../workspace"
import { iconLetter, iconTint } from "@/pages/digitals/components/cardVisual"

const router = useRouter()
const ws = useDigitalWorkspace()

const mode = ws.mode
const digitalId = computed(() => ws.digitalId.value)
const needsSave = computed(() => !digitalId.value)

const sources = ref<IKnowledgeSourceItem[]>([])
const loading = ref(false)
const creating = ref(false)

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

async function loadSources() {
  if (!digitalId.value) {
    sources.value = []
    return
  }
  loading.value = true
  try {
    const res = await listKnowledgeSourceApi({ digitalId: digitalId.value })
    if (res.code !== 0) throw new Error(res.msg || "加载知识源失败")
    sources.value = res.result?.list ?? []
  } catch (err) {
    ElMessage.error(errorMessage(err, "加载知识源失败"))
  } finally {
    loading.value = false
  }
}

function sourceSummary(source: IKnowledgeSourceItem): string {
  if (source.documentCount > 0) return `${source.documentCount} 篇文档已导入`
  return "还没有导入文档"
}

async function createDigitalFirst() {
  creating.value = true
  try {
    await ws.ensureCreated()
  } finally {
    creating.value = false
  }
}

/** 创建：直接进独立子路由，先选数据源，再由子路由落库 */
function goCreate() {
  if (mode.value !== "prompt" || !digitalId.value) return
  void router.push({
    name: "DigitalKnowledgeSourceCreate",
    params: { digitalId: digitalId.value }
  })
}

/** 点卡片进入独立子路由，详情数据由子路由页按 id 自行加载 */
function openSource(knowledgeSourceId: string) {
  if (!digitalId.value) return
  void router.push({
    name: "DigitalKnowledgeSourceDetail",
    params: { digitalId: digitalId.value, knowledgeSourceId }
  })
}

watch(digitalId, () => {
  void loadSources()
})

onMounted(() => {
  void loadSources()
})
</script>

<style scoped lang="less">
@import "../../components/toolCards.less";

.ks-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}

.ks-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__action {
    font-size: 12px;
    color: var(--el-color-primary);
  }
}

.ks-draft {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  font-size: 13px;
  color: var(--el-text-color-regular);
}
</style>
