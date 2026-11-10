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
  <div class="console-head">
    <div class="console-head__top">
      <button class="console-back" type="button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        {{ backLabel || "返回列表" }}
      </button>
      <slot name="top-right" />
    </div>

    <div class="console-head__main">
      <div class="console-head__text">
        <div class="console-head__title-row">
          <h1 class="console-head__title">{{ title }}</h1>
          <span v-if="badge" class="ds-badge" :class="`ds-badge--${badgeTone || 'neutral'}`">{{ badge }}</span>
          <span v-if="loading" class="console-head__loading">加载中…</span>
        </div>
        <p v-if="desc" class="console-head__desc">{{ desc }}</p>
      </div>
      <div v-if="$slots.actions" class="console-head__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from "vue"
import type { PropType } from "vue"
import { ArrowLeft } from "@element-plus/icons-vue"
import { useRouter } from "vue-router"

export default defineComponent({
  name: "PageHeader",
  props: {
    title: { type: String, required: true },
    backTo: { type: String, required: true },
    desc: { type: String },
    backLabel: { type: String },
    badge: { type: String },
    badgeTone: { type: Object as PropType<"neutral" | "success" | "warning" | "danger"> },
    loading: { type: Boolean }
  },
  setup(props) {
    const router = useRouter()
    const goBack = () => router.push(props.backTo)
    return { ...toRefs(props), props, router, goBack, ArrowLeft, useRouter }
  }
})
</script>

<style lang="less" scoped>
.console-head {
  margin-bottom: var(--ds-space-6);
}

.console-head__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-3);
  margin-bottom: var(--ds-space-3);
}

.console-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ds-neutral-600);
  font-family: inherit;
  font-size: var(--ds-fs-13);
  cursor: pointer;

  &:hover { color: var(--ds-brand); }
}

.console-head__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ds-space-4);
}

.console-head__text { min-width: 0; }

.console-head__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--ds-space-2);
}

.console-head__title {
  font-size: var(--ds-fs-24);
  font-weight: var(--ds-weight-bold);
  color: var(--ds-neutral-900);
  line-height: var(--ds-lh-heading);
  word-break: break-all;
}

.console-head__desc {
  margin-top: var(--ds-space-2);
  font-size: var(--ds-fs-13);
  color: var(--ds-neutral-600);
  line-height: var(--ds-lh-body);
}

.console-head__loading {
  font-size: var(--ds-fs-13);
  color: var(--ds-neutral-400);
}

.console-head__actions {
  display: flex;
  flex: 0 0 auto;
  gap: var(--ds-space-2);
}

@media (max-width: 767px) {
  .console-head__main { flex-direction: column; align-items: stretch; }
  .console-head__actions { justify-content: flex-start; }
}
</style>
