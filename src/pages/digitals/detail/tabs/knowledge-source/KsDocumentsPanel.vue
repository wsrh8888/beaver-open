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

  知识源「文档」分区：上面是这个知识源引入的 N 个知识库（可引入 / 移除引用），
  下面把这些库里的文档聚合展示。文档本体不属于知识源，所以这里只读，
  要增删文档请去 /knowledge 的对应知识库。
-->

<template>
  <div class="ks-docs">
    <div class="panel-toolbar">
      <el-input
        v-model="keyword"
        size="small"
        clearable
        placeholder="搜索文档名称"
        class="panel-toolbar__search"
        @clear="loadDocs"
        @keyup.enter="loadDocs"
      />
      <el-button size="small" type="primary" :icon="Plus" @click="pickerVisible = true">
        引入知识库
      </el-button>
    </div>

    <div class="ks-refs">
      <div class="ks-refs__head">
        <span class="ks-refs__label">引入的知识库</span>
        <span class="ks-refs__count">{{ source.knowledgeIds.length }} 个</span>
        <el-button
          v-if="missingRefs.length && catalogLoaded"
          link
          type="primary"
          size="small"
          :loading="cleaning"
          @click="cleanMissing"
        >
          清理 {{ missingRefs.length }} 个失效引用
        </el-button>
      </div>

      <div v-if="source.knowledgeIds.length" class="ks-refs__list">
        <div v-for="item in refs" :key="item.collectionId" class="ks-ref">
          <span class="ks-ref__dot" :class="{ 'ks-ref__dot--missing': item.missing }" />
          <el-button link type="primary" class="ks-ref__name" @click="openKnowledgeBase(item.collectionId)">
            {{ item.name }}
          </el-button>
          <span v-if="item.missing" class="ks-ref__tag">已删除</span>
          <span v-else class="ks-ref__count">{{ item.documentCount }} 篇文档</span>
          <el-button
            link
            type="danger"
            size="small"
            class="ks-ref__remove"
            :loading="removingId === item.collectionId"
            :disabled="!!removingId"
            @click="removeRef(item.collectionId)"
          >
            移除引用
          </el-button>
        </div>
      </div>
      <div v-else class="ks-refs__empty">
        还没有引入知识库，点右上角「引入知识库」从平台里选择。
      </div>
    </div>

    <el-table v-loading="docLoading" :data="docs" size="default" empty-text="暂无文档">
      <el-table-column type="index" label="序号" width="64" align="center" />
      <el-table-column prop="title" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="来源知识库" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.collectionName || row.collectionId }}</template>
      </el-table-column>
      <el-table-column label="学习时间" width="140">
        <template #default="{ row }">{{ formatTime(row.indexedAt) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag size="small" :type="indexTagType(row.indexStatus)">
            {{ indexStatusLabel(row.indexStatus) }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <LibraryPickerDialog
      v-model="pickerVisible"
      :digital-id="digitalId"
      :knowledge-source-id="source.knowledgeSourceId"
      :existing-ids="source.knowledgeIds"
      @done="onPicked"
    />
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { computed, onMounted, ref, watch, defineComponent, toRefs } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import {
  listKnowledgeBaseApi,
  listKnowledgeSourceDocApi,
  unbindKnowledgeSourceApi
} from "@/api/knowledge"
import type {
  IKnowledgeBase,
  IKnowledgeSourceDoc,
  IKnowledgeSourceItem
} from "@/types/api/knowledge"
import LibraryPickerDialog from "./LibraryPickerDialog.vue"

export default defineComponent({
  name: "KsDocumentsPanel",
  components: { LibraryPickerDialog },
  props: {
    digitalId: { type: String, required: true },
    source: { type: Object as PropType<IKnowledgeSourceItem>, required: true }
  },
  emits: ["refresh"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    function formatTime(unix: number): string {
      if (!unix) return "—"
      const d = new Date(unix * 1000)
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    const router = useRouter()
    const docs = ref<IKnowledgeSourceDoc[]>([])
    const catalog = ref<IKnowledgeBase[]>([])
    const catalogLoaded = ref(false)
    const docLoading = ref(false)
    const keyword = ref("")
    const pickerVisible = ref(false)
    const removingId = ref("")
    const cleaning = ref(false)

    const baseById = computed(() => {
      const map = new Map<string, IKnowledgeBase>()
      catalog.value.forEach(item => map.set(item.collectionId, item))
      return map
    })

    /** 目录加载完成前不把引用判成失效，避免网络抖动时误显示「已删除」。 */
    const refs = computed(() =>
      props.source.knowledgeIds.map(collectionId => {
        const item = baseById.value.get(collectionId)
        return {
          collectionId,
          name: item?.name || collectionId,
          documentCount: item?.documentCount ?? 0,
          missing: catalogLoaded.value && !item
        }
      })
    )
    const missingRefs = computed(() => refs.value.filter(item => item.missing))

    const loadCatalog = async () => {
      try {
        const res = await listKnowledgeBaseApi()
        if (res.code !== 0) throw new Error(res.msg || "加载知识库失败")
        catalog.value = res.result?.list ?? []
        catalogLoaded.value = true
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载知识库失败"))
      }
    }

    const loadDocs = async () => {
      docLoading.value = true
      try {
        const res = await listKnowledgeSourceDocApi({
          digitalId: props.digitalId,
          knowledgeSourceId: props.source.knowledgeSourceId,
          keyword: keyword.value.trim() || undefined
        })
        if (res.code !== 0) throw new Error(res.msg || "加载文档失败")
        docs.value = res.result?.list ?? []
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载文档失败"))
      } finally {
        docLoading.value = false
      }
    }

    const removeRef = async (collectionId: string) => {
      let confirmed = true
      try {
        await ElMessageBox.confirm("移除后该知识库里的文档不再参与这个知识源的检索，知识库本身不受影响。", "移除引用", { type: "warning" })
      } catch {
        confirmed = false
      }
      if (!confirmed) return
      removingId.value = collectionId
      try {
        const res = await unbindKnowledgeSourceApi({
          digitalId: props.digitalId,
          knowledgeSourceId: props.source.knowledgeSourceId,
          collectionId
        })
        if (res.code !== 0) throw new Error(res.msg || "移除失败")
        ElMessage.success("已移除引用")
        emit("refresh")
        await loadDocs()
      } catch (err) {
        ElMessage.error(errorMessage(err, "移除失败"))
      } finally {
        removingId.value = ""
      }
    }

    const cleanMissing = async () => {
      const ids = missingRefs.value.map(item => item.collectionId)
      if (!ids.length) return
      cleaning.value = true
      try {
        for (const collectionId of ids) {
          const res = await unbindKnowledgeSourceApi({
            digitalId: props.digitalId,
            knowledgeSourceId: props.source.knowledgeSourceId,
            collectionId
          })
          if (res.code !== 0) throw new Error(res.msg || "清理失败")
        }
        ElMessage.success("已清理失效引用")
        emit("refresh")
        await loadDocs()
      } catch (err) {
        ElMessage.error(errorMessage(err, "清理失败"))
      } finally {
        cleaning.value = false
      }
    }

    const onPicked = () => {
      emit("refresh")
      void loadDocs()
    }

    const indexStatusLabel = (status?: string) => {
      if (status === "ready") return "已完成"
      if (status === "indexing") return "学习中"
      if (status === "failed") return "失败"
      return "待学习"
    }
    const indexTagType = (status?: string) => {
      if (status === "ready") return "success"
      if (status === "indexing") return "warning"
      if (status === "failed") return "danger"
      return "info"
    }

    const openKnowledgeBase = (collectionId: string) => router.push(`/knowledge/${collectionId}`)

    watch(() => props.source.knowledgeIds.join(","), () => void loadDocs())
    onMounted(() => {
      void loadCatalog()
      void loadDocs()
    })
    return {
      ...toRefs(props), props, emit, errorMessage, formatTime, router, docs, catalog,
      catalogLoaded, docLoading, keyword, pickerVisible, removingId, cleaning, baseById, refs,
      missingRefs, loadCatalog, loadDocs, removeRef, cleanMissing, onPicked, indexStatusLabel,
      indexTagType, openKnowledgeBase, computed, onMounted, ref, watch, useRouter, ElMessage,
      ElMessageBox, Plus, listKnowledgeBaseApi, listKnowledgeSourceDocApi,
      unbindKnowledgeSourceApi, LibraryPickerDialog
    }
  }
})
</script>

<style scoped lang="less">
.panel-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  justify-content: flex-end;

  &__search {
    max-width: 240px;
    margin-right: auto;
  }
}

.ks-refs {
  margin-bottom: 16px;
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;

  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  &__label {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__empty {
    padding: 8px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.ks-ref {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--el-color-success);
    flex-shrink: 0;

    &--missing {
      background: var(--el-color-danger);
    }
  }

  &__name {
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__count {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__tag {
    font-size: 12px;
    color: var(--el-color-danger);
  }

  &__remove {
    margin-left: auto;
  }
}
</style>
