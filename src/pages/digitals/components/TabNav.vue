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
  <nav class="ds-tabbar" aria-label="详情分区">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="ds-tabbar__item"
      :class="{ 'is-active': tab.key === active, 'is-disabled': isDisabled(tab.key) }"
      type="button"
      :disabled="isDisabled(tab.key)"
      :aria-current="tab.key === active ? 'page' : undefined"
      :title="isDisabled(tab.key) ? '当前编排方式不支持此分区' : undefined"
      @click="!isDisabled(tab.key) && emit('select', tab.key)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<script lang="ts">
import { defineComponent, toRefs, computed } from "vue"
import type { PropType } from "vue"
interface ConsoleTab {
  key: string
  label: string
}

export default defineComponent({
  name: "TabNav",
  props: {
    tabs: { type: Array as PropType<ConsoleTab[]>, required: true },
    active: { type: String, required: true },
    disabled: { type: Array as PropType<string[]> }
  },
  emits: ["select"],
  setup(props, { emit }) {
    const disabled = computed(() => props.disabled ?? [])

    const isDisabled = (key: string) => disabled.value.includes(key)
    return { ...toRefs(props), props, emit, disabled, isDisabled }
  }
})
</script>

<style lang="less" scoped>
.ds-tabbar {
  display: flex;
  align-items: center;
  gap: var(--ds-space-5);
  height: 44px;
  margin-bottom: var(--ds-space-5);
  border-bottom: 1px solid var(--ds-border);
  overflow-x: auto;
  scrollbar-width: none;
}

.ds-tabbar::-webkit-scrollbar { display: none; }

.ds-tabbar__item {
  position: relative;
  flex: 0 0 auto;
  height: 44px;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: var(--ds-neutral-600);
  font-family: inherit;
  font-size: var(--ds-fs-14);
  white-space: nowrap;
  cursor: pointer;

  &:hover { color: var(--ds-neutral-900); }

  &.is-disabled {
    color: var(--ds-neutral-400);
    cursor: not-allowed;
    pointer-events: none;

    &:hover { color: var(--ds-neutral-400); }
  }

  &.is-active {
    color: var(--ds-brand);
    font-weight: var(--ds-weight-medium);

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -1px;
      height: 2px;
      background: var(--ds-brand);
    }
  }
}
</style>
