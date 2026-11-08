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
import { CircleCheck } from "@element-plus/icons-vue"

defineProps<{
  active: boolean
  title: string
  tag?: string
  desc: string
  bullets: string[]
}>()

const emit = defineEmits<{
  (e: "select"): void
}>()
</script>

<template>
  <button
    class="ds-choice"
    :class="{ 'is-active': active }"
    type="button"
    :aria-pressed="active"
    @click="emit('select')"
  >
    <span class="ds-choice__head">
      <span class="ds-choice__icon"><slot name="icon" /></span>
      <span class="ds-choice__title">{{ title }}</span>
      <span v-if="tag" class="ds-choice__tag">{{ tag }}</span>
      <el-icon v-if="active" class="ds-choice__check"><CircleCheck /></el-icon>
    </span>
    <span class="ds-choice__desc">{{ desc }}</span>
    <ul class="ds-choice__bullets">
      <li v-for="bullet in bullets" :key="bullet">{{ bullet }}</li>
    </ul>
  </button>
</template>

<style lang="less" scoped>
.ds-choice {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-2);
  width: 100%;
  padding: var(--ds-space-5);
  text-align: left;
  font-family: inherit;
  background: var(--ds-neutral-0);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  transition: border-color var(--ds-duration) var(--ds-ease), background-color var(--ds-duration) var(--ds-ease);

  &:hover { border-color: var(--ds-brand-200); }

  &.is-active {
    border-color: var(--ds-brand);
    background: var(--ds-brand-50);
    box-shadow: inset 0 0 0 1px var(--ds-brand);
  }
}

.ds-choice__head {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
}

.ds-choice__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  border-radius: var(--ds-radius-sm);
  background: var(--ds-neutral-100);
  color: var(--ds-neutral-700);
  font-size: 16px;
}

.is-active .ds-choice__icon {
  background: var(--ds-neutral-0);
  color: var(--ds-brand);
}

.ds-choice__title {
  font-size: var(--ds-fs-16);
  font-weight: var(--ds-weight-medium);
  color: var(--ds-neutral-900);
}

.ds-choice__tag {
  padding: 1px 6px;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  font-size: var(--ds-fs-12);
  color: var(--ds-neutral-600);
  background: var(--ds-neutral-0);
}

.ds-choice__check {
  margin-left: auto;
  font-size: 18px;
  color: var(--ds-brand);
}

.ds-choice__desc {
  font-size: var(--ds-fs-13);
  line-height: var(--ds-lh-body);
  color: var(--ds-neutral-600);
}

.ds-choice__bullets {
  list-style: none;
  margin-top: var(--ds-space-1);

  li {
    position: relative;
    padding-left: var(--ds-space-4);
    font-size: var(--ds-fs-13);
    line-height: 22px;
    color: var(--ds-neutral-700);

    &::before {
      content: "";
      position: absolute;
      left: 2px;
      top: 9px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--ds-neutral-300);
    }
  }
}
</style>
