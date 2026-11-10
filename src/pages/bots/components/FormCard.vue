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
  <section class="ds-form-card" :class="{ 'ds-form-card--danger': danger }">
    <header class="ds-form-card__head">
      <div class="ds-form-card__head-text">
        <h2 class="ds-form-card__title">{{ title }}</h2>
        <p v-if="desc" class="ds-form-card__desc">{{ desc }}</p>
      </div>
      <div v-if="$slots.extra" class="ds-form-card__extra">
        <slot name="extra" />
      </div>
    </header>

    <div class="ds-form-card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="ds-form-card__foot">
      <slot name="footer" />
    </footer>
  </section>
</template>

<script lang="ts">
import { defineComponent, toRefs } from "vue"
import type { PropType } from "vue"


export default defineComponent({
  name: "FormCard",
  props: {
    title: { type: String, required: true },
    desc: { type: String },
    danger: { type: Boolean }
  },
  setup(props) {
    // no setup state
    return { ...toRefs(props), props }
  }
})
</script>

<style lang="less" scoped>
.ds-form-card {
  max-width: 860px;
  background: var(--ds-neutral-0);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  margin-bottom: var(--ds-space-5);

  &--danger { border-color: var(--ds-danger-border); }
}

.ds-form-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ds-space-4);
  padding: var(--ds-space-5) var(--ds-space-6);
  border-bottom: 1px solid var(--ds-border-light);
}

.ds-form-card__head-text { min-width: 0; }

.ds-form-card__title {
  font-size: var(--ds-fs-16);
  font-weight: var(--ds-weight-medium);
  color: var(--ds-neutral-900);
}

.ds-form-card__desc {
  margin-top: var(--ds-space-1);
  font-size: var(--ds-fs-13);
  line-height: var(--ds-lh-body);
  color: var(--ds-neutral-600);
}

.ds-form-card__extra { flex: 0 0 auto; }

.ds-form-card__body { padding: var(--ds-space-6); }

.ds-form-card__foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ds-space-2);
  padding: var(--ds-space-3) var(--ds-space-6);
  border-top: 1px solid var(--ds-border-light);
  background: var(--ds-neutral-50);
  border-radius: 0 0 var(--ds-radius-md) var(--ds-radius-md);
}

@media (max-width: 767px) {
  .ds-form-card__head,
  .ds-form-card__body,
  .ds-form-card__foot { padding-left: var(--ds-space-4); padding-right: var(--ds-space-4); }
  .ds-form-card__foot { flex-wrap: wrap; justify-content: flex-start; }
}
</style>
