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

  选择人员面板：可见范围选「部分公开」时，用来挑「已选人员」。
  - 输入用户 ID 或邮箱，走 friend 域的用户搜索接口精确查一个用户；
  - 结果卡片点「添加」进已选列表，已选列表可逐个移除；
  - 搜索接口不可用时留一个「按 ID 直接添加」的兜底，不至于卡死流程。
  只负责挑选，落库由调用方在「保存」时提交。
-->

<template>
  <el-dialog
    :model-value="modelValue"
    title="选择人员"
    width="520px"
    :close-on-click-modal="false"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @open="reset"
  >
    <div class="picker">
      <el-input
        v-model="keyword"
        placeholder="输入用户 ID 或邮箱"
        clearable
        :disabled="searching"
        @keyup.enter="runSearch"
      >
        <template #append>
          <el-button :loading="searching" @click="runSearch">
            搜索
          </el-button>
        </template>
      </el-input>

      <div v-if="result" class="picker__result">
        <span class="picker__avatar">
          <img v-if="avatarUrl" :src="avatarUrl" alt="">
          <template v-else>{{ (result.nickName || result.userId).slice(0, 1) }}</template>
        </span>
        <span class="picker__meta">
          <span class="picker__name">{{ result.nickName || result.userId }}</span>
          <span class="picker__id">{{ result.userId }}<template v-if="result.email"> · {{ result.email }}</template></span>
        </span>
        <el-button
          size="small"
          type="primary"
          plain
          :disabled="isSelected(result.userId)"
          @click="addUser(result.userId, result.nickName)"
        >
          {{ isSelected(result.userId) ? "已添加" : "添加" }}
        </el-button>
      </div>

      <div v-else-if="searched && !searching" class="picker__miss">
        <span>没有找到对应用户</span>
        <el-button link type="primary" @click="addRaw(keyword)">
          按 ID 直接添加
        </el-button>
      </div>

      <div class="picker__selected">
        <div class="picker__selected-head">
          <span>已选人员</span>
          <span class="picker__count">{{ selected.length }} 人</span>
        </div>
        <div v-if="selected.length" class="picker__chips">
          <el-tag
            v-for="item in selected"
            :key="item.userId"
            closable
            :disable-transitions="true"
            @close="removeUser(item.userId)"
          >
            {{ item.label || item.userId }}
          </el-tag>
        </div>
        <p v-else class="picker__empty">
          暂未选择
        </p>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">
        取消
      </el-button>
      <el-button type="primary" @click="confirm">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { ElMessage } from "element-plus"
import { resolveImageUrl, searchImUserApi } from "@/api/im"
import type { ISearchImUserRes } from "@/types/api/im"

interface SelectedPerson {
  userId: string
  label: string
}

const props = defineProps<{
  modelValue: boolean
  /** 已选人员 ID（来自数字伙伴的 viewerIds） */
  memberIds: string[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "confirm", userIds: string[]): void
}>()

const keyword = ref("")
const searching = ref(false)
const searched = ref(false)
const result = ref<ISearchImUserRes | null>(null)
const selected = ref<SelectedPerson[]>([])

const avatarUrl = computed(() => resolveImageUrl(result.value?.avatar))

function reset() {
  keyword.value = ""
  searching.value = false
  searched.value = false
  result.value = null
  // 已知 ID 没有昵称，先用 ID 当展示文案
  selected.value = props.memberIds.map(id => ({ userId: id, label: id }))
}

function isSelected(userId: string): boolean {
  return selected.value.some(item => item.userId === userId)
}

function addUser(userId: string, label?: string) {
  if (!userId || isSelected(userId)) return
  selected.value.push({ userId, label: label || userId })
}

function addRaw(value: string) {
  const id = value.trim()
  if (!id) return
  addUser(id)
  ElMessage.success("已添加")
}

function removeUser(userId: string) {
  selected.value = selected.value.filter(item => item.userId !== userId)
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

async function runSearch() {
  const value = keyword.value.trim()
  if (!value || searching.value) return
  searching.value = true
  result.value = null
  searched.value = false
  try {
    const res = await searchImUserApi({
      keyword: value,
      type: value.includes("@") ? "email" : "userId"
    })
    if (res.code !== 0) throw new Error(res.msg || "搜索失败")
    result.value = res.result ?? null
  } catch (err) {
    ElMessage.error(errorMessage(err, "搜索失败"))
  } finally {
    searching.value = false
    searched.value = true
  }
}

function confirm() {
  emit("confirm", selected.value.map(item => item.userId))
  emit("update:modelValue", false)
}
</script>

<style scoped lang="less">
.picker {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__result {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid var(--ds-border);
    border-radius: var(--ds-radius-md);
    background: var(--ds-neutral-50);
  }

  &__avatar {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 10px;
    background: var(--ds-neutral-0);
    border: 1px solid var(--ds-border);
    font-size: 15px;
    font-weight: var(--ds-weight-bold);
    color: var(--ds-neutral-600);

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1 1 auto;
    min-width: 0;
  }

  &__name {
    font-size: var(--ds-fs-14);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-neutral-900);
  }

  &__id {
    font-size: var(--ds-fs-12);
    color: var(--ds-neutral-600);
    word-break: break-all;
  }

  &__miss {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--ds-fs-13);
    color: var(--ds-neutral-600);
  }

  &__selected {
    padding-top: 12px;
    border-top: 1px solid var(--ds-border-light);
  }

  &__selected-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: var(--ds-fs-14);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-neutral-900);
  }

  &__count {
    font-size: var(--ds-fs-12);
    font-weight: 400;
    color: var(--ds-neutral-600);
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-height: 180px;
    overflow-y: auto;
  }

  &__empty {
    margin: 0;
    font-size: var(--ds-fs-13);
    color: var(--ds-neutral-600);
  }
}
</style>
