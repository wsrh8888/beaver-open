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

  从平台知识库里多选引入到当前知识源。对齐 cloud 的 LibraryDocPickerDialog 的位置，
  但选的是知识库而不是在线文档：知识库本体在 /knowledge 维护，知识源只存引用。
-->

<template>
  <el-dialog
    :model-value="modelValue"
    width="520px"
    destroy-on-close
    append-to-body
    class="tool-dialog"
    @update:model-value="close"
    @opened="onOpened"
  >
    <template #header>
      <div class="tool-dialog-header">
        <h2 class="tool-dialog-header__title">引入知识库</h2>
      </div>
    </template>

    <el-input
      v-model="keyword"
      clearable
      placeholder="搜索名称、编码…"
      :prefix-icon="Search"
      class="ks-picker__search"
    />

    <div v-loading="loading" class="ks-picker__list">
      <el-checkbox-group v-if="filtered.length" v-model="picked" class="ks-picker__group">
        <label v-for="item in filtered" :key="item.collectionId" class="ks-picker__item">
          <el-checkbox :value="item.collectionId">
            <span class="ks-picker__name">{{ item.name }}</span>
            <span class="ks-picker__meta">{{ item.documentCount }} 篇文档</span>
          </el-checkbox>
        </label>
      </el-checkbox-group>
      <div v-else class="ks-picker__empty">
        <p>{{ loading ? "加载中…" : catalog.length ? "没有可选的知识库" : "平台还没有知识库" }}</p>
        <el-button link type="primary" @click="goKnowledge">去知识库新建</el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="close(false)">取消</el-button>
      <el-button type="primary" :loading="saving" :disabled="!picked.length" @click="submit">
        引入
      </el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { computed, ref, defineComponent, toRefs } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { Search } from "@element-plus/icons-vue"
import { bindKnowledgeSourceApi, listKnowledgeBaseApi } from "@/api/knowledge"
import type { IKnowledgeBase } from "@/types/api/knowledge"

export default defineComponent({
  name: "LibraryPickerDialog",
  props: {
    modelValue: { type: Boolean, required: true },
    digitalId: { type: String, required: true },
    knowledgeSourceId: { type: String, required: true },
    existingIds: { type: Array as PropType<string[]>, required: true }
  },
  emits: ["update:modelValue", "done"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const router = useRouter()
    const catalog = ref<IKnowledgeBase[]>([])
    const keyword = ref("")
    const picked = ref<string[]>([])
    const loading = ref(false)
    const saving = ref(false)

    const available = computed(() =>
      catalog.value.filter(item => !props.existingIds.includes(item.collectionId))
    )
    const filtered = computed(() => {
      const text = keyword.value.trim().toLowerCase()
      return text
        ? available.value.filter(item =>
            `${item.name} ${item.collectionId}`.toLowerCase().includes(text))
        : available.value
    })

    const close = (value: boolean) => emit("update:modelValue", value)

    const onOpened = async () => {
      keyword.value = ""
      picked.value = []
      loading.value = true
      try {
        const res = await listKnowledgeBaseApi()
        if (res.code !== 0) throw new Error(res.msg || "加载知识库失败")
        catalog.value = res.result?.list ?? []
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载知识库失败"))
      } finally {
        loading.value = false
      }
    }

    const submit = async () => {
      if (!picked.value.length) return
      saving.value = true
      try {
        const res = await bindKnowledgeSourceApi({
          digitalId: props.digitalId,
          knowledgeSourceId: props.knowledgeSourceId,
          knowledgeIds: picked.value
        })
        if (res.code !== 0) throw new Error(res.msg || "引入失败")
        ElMessage.success(`已引入 ${picked.value.length} 个知识库`)
        emit("done")
        close(false)
      } catch (err) {
        ElMessage.error(errorMessage(err, "引入失败"))
      } finally {
        saving.value = false
      }
    }

    const goKnowledge = () => router.push("/knowledge")
    return {
      ...toRefs(props), props, emit, errorMessage, router, catalog, keyword, picked, loading,
      saving, available, filtered, close, onOpened, submit, goKnowledge, computed, ref,
      useRouter, ElMessage, Search, bindKnowledgeSourceApi, listKnowledgeBaseApi
    }
  }
})
</script>

<style scoped lang="less">
.ks-picker {
  &__search {
    margin-bottom: 12px;
  }

  &__list {
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  &__group {
    display: block;
    width: 100%;
  }

  &__item {
    display: block;
    padding: 10px 14px;
    cursor: pointer;

    &:not(:last-child) {
      border-bottom: 1px solid var(--el-border-color-extra-light);
    }

    &:hover {
      background: var(--el-fill-color-lighter);
    }

    :deep(.el-checkbox) {
      width: 100%;
      height: auto;
    }

    :deep(.el-checkbox__label) {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
  }

  &__name {
    font-size: 14px;
    color: var(--el-text-color-primary);
  }

  &__meta {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__empty {
    padding: 28px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}
</style>
