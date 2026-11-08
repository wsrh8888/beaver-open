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
const props = defineProps<{
  modelValue: string[]
  placeholder?: string
  hint?: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void
}>()

// 支持一次粘贴 "user_a, user_b"：拆成多个 tag 并去重，避免用户手工敲逗号文本。
const update = (value: string[]) => {
  const parts = value
    .flatMap(item => String(item).split(/[,，\s]+/))
    .map(item => item.trim())
    .filter(Boolean)
  emit("update:modelValue", Array.from(new Set(parts)))
}
</script>

<template>
  <div>
    <el-select
      :model-value="props.modelValue"
      multiple
      filterable
      allow-create
      default-first-option
      :reserve-keyword="false"
      :placeholder="placeholder || '输入用户 ID 后按回车添加'"
      style="width: 100%"
      @update:model-value="update"
    />
    <p class="ds-hint" style="margin-top: var(--ds-space-2)">
      {{ hint || "输入一个用户 ID 后按回车；也可一次粘贴多个，用逗号或空格分隔。留空表示清空列表。" }}
    </p>
  </div>
</template>
