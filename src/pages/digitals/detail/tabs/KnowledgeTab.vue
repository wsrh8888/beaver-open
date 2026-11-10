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

  知识源分区：知识源 ≠ 知识库。
  知识库由平台运行时保管文档与索引本体；知识源是 open_knowledge_source 表里的后端一等实体，
  归当前数字伙伴所有，只持有 platform 索引集合的引用。用户把海狸内部的在线文档地址粘贴进来，
  经后端解析 + 鉴权后作为引用挂到该集合上，由平台侧异步拉取并索引（引用云文档语义）。
  进入某个知识源后由 KsDetailView 按「文档 / 召回测试 / 设置」三分区展开。
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

    <template v-if="!activeSource">
      <div class="ks-head">
        <div>
          <h3 class="ks-head__title">知识源</h3>
          <p class="ks-head__desc">
            知识源是给这个智能体用的检索分组实体。把海狸内部的在线文档地址粘贴进来，平台会自动拉取并索引，
            检索时按引用实时跟随源文档更新，无需把文档搬到知识源里。
          </p>
        </div>
        <el-button
          type="primary"
          :icon="Plus"
          :disabled="mode !== 'prompt' || needsSave"
          @click="createSource"
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
            @click="createSource"
          >
            <div class="tool-card__body tool-card__body--entry">
              <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
              <span class="tool-card__entry-label">创建知识源</span>
              <span class="tool-card__entry-hint">组合多份在线文档供智能体检索</span>
            </div>
          </button>

          <button
            v-for="source in sources"
            :key="source.knowledgeSourceId"
            type="button"
            class="tool-card"
            @click="activeId = source.knowledgeSourceId"
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

          <p v-if="!loading && !needsSave && !sources.length" class="ks-empty">
            还没有知识源。创建一个，再把海狸内部的在线文档地址导入进来。
          </p>
        </div>
      </div>
    </template>

    <KsDetailView
      v-else
      :key="activeSource.knowledgeSourceId"
      :digital-id="digitalId"
      :source="activeSource"
      @back="activeId = ''"
      @refresh="loadSources"
      @deleted="onDeleted"
    />
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref, watch, defineComponent } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { listKnowledgeSourceApi, saveKnowledgeSourceApi } from "@/api/knowledge"
import type { IKnowledgeSourceItem } from "@/types/api/knowledge"
import { useDigitalWorkspace } from "../workspace"
import { iconLetter, iconTint } from "@/pages/digitals/components/cardVisual"
import KsDetailView from "./knowledge-source/KsDetailView.vue"

export default defineComponent({
  name: "KnowledgeTab",
  components: { Plus, KsDetailView },
  setup() {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const ws = useDigitalWorkspace()
    const { mode } = ws

    const digitalId = computed(() => ws.digitalId.value)
    const needsSave = computed(() => !digitalId.value)

    const sources = ref<IKnowledgeSourceItem[]>([])
    const loading = ref(false)
    const creating = ref(false)
    /** 空 = 知识源列表；非空 = 进入某个知识源的三分区详情。 */
    const activeId = ref("")

    const activeSource = computed(() =>
      sources.value.find(item => item.knowledgeSourceId === activeId.value) ?? null
    )

    const loadSources = async () => {
      if (!digitalId.value) {
        sources.value = []
        return
      }
      loading.value = true
      try {
        const res = await listKnowledgeSourceApi({ digitalId: digitalId.value })
        if (res.code !== 0) throw new Error(res.msg || "加载知识源失败")
        sources.value = res.result?.list ?? []
        // 详情视图还开着时，如果实体已被删掉就退回列表
        if (activeId.value && !activeSource.value) activeId.value = ""
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载知识源失败"))
      } finally {
        loading.value = false
      }
    }

    const sourceSummary = (source: IKnowledgeSourceItem) => {
      if (source.documentCount > 0) return `${source.documentCount} 篇在线文档已导入`
      return "还没有导入文档"
    }

    const createDigitalFirst = async () => {
      creating.value = true
      try {
        await ws.ensureCreated()
      } finally {
        creating.value = false
      }
    }

    const createSource = async () => {
      if (mode.value !== "prompt" || !digitalId.value) return
      let name = ""
      try {
        const { value } = await ElMessageBox.prompt("名称", "创建知识源", {
          inputPattern: /\S+/,
          inputErrorMessage: "名称不能为空"
        })
        name = value?.trim() || ""
      } catch {
        // 用户取消输入
        return
      }
      if (!name) return
      try {
        const res = await saveKnowledgeSourceApi({ digitalId: digitalId.value, name })
        if (res.code !== 0) throw new Error(res.msg || "创建失败")
        ElMessage.success("已创建")
        await loadSources()
      } catch (err) {
        ElMessage.error(errorMessage(err, "创建失败"))
      }
    }

    const onDeleted = () => {
      activeId.value = ""
      void loadSources()
    }

    watch(digitalId, () => {
      activeId.value = ""
      void loadSources()
    })
    onMounted(() => {
      void loadSources()
    })
    return {
      errorMessage, ws, mode, digitalId, needsSave, sources, loading,
      creating, activeId, activeSource, loadSources, sourceSummary,
      createDigitalFirst, createSource, onDeleted, computed, onMounted, ref,
      watch, ElMessage, ElMessageBox, Plus, listKnowledgeSourceApi,
      saveKnowledgeSourceApi, useDigitalWorkspace, iconLetter, iconTint, KsDetailView
    }
  }
})
</script>

<style scoped lang="less">
@import "../../components/toolCards.less";

.ks-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 6px 0 0;
    max-width: 720px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--el-text-color-secondary);
  }

  &__link {
    font-size: 13px;
    vertical-align: baseline;
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

.ks-empty {
  grid-column: 1 / -1;
  padding: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
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
