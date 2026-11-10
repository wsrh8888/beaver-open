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
  <div class="ds-once">
    <div class="ds-once__notice">
      <el-icon><Warning /></el-icon>
      <span class="ds-once__notice-text">{{ notice || "以下凭据只在这里明文显示一次，服务端只保存哈希。请立即复制保存，离开本页后只能换发。" }}</span>
      <el-button
        v-if="allText"
        size="small"
        class="ds-once__copy-all"
        @click="copyText(allText, '全部凭据已复制')"
      >
        <el-icon><CopyDocument /></el-icon>
        复制全部
      </el-button>
    </div>

    <div v-for="item in items" :key="item.label" class="ds-once__row">
      <div class="ds-once__meta">
        <span class="ds-once__label">{{ item.label }}</span>
        <span v-if="item.hint" class="ds-hint">{{ item.hint }}</span>
      </div>
      <code class="ds-once__value ds-mono">{{ item.value || "—" }}</code>
      <el-button link type="primary" :disabled="!item.value" @click="copyText(item.value, `${item.label} 已复制`)">
        <el-icon><CopyDocument /></el-icon>
        复制
      </el-button>
    </div>

    <div v-if="$slots.footer" class="ds-once__foot">
      <slot name="footer" />
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { computed, defineComponent, toRefs } from "vue"
import { Warning, CopyDocument } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

interface CredentialItem {
  label: string
  value: string
  hint?: string
}

export default defineComponent({
  name: "CredentialPanel",
  components: { Warning, CopyDocument },
  props: {
    items: { type: Array as PropType<CredentialItem[]>, required: true },
    notice: { type: String }
  },
  setup(props) {
    async function copyText(text: string, label = "已复制"): Promise<void> {
      if (!text) {
        ElMessage.warning("内容为空")
        return
      }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
        } else {
          const el = document.createElement("textarea")
          el.value = text
          el.style.position = "fixed"
          el.style.opacity = "0"
          document.body.appendChild(el)
          el.select()
          const ok = document.execCommand("copy")
          document.body.removeChild(el)
          if (!ok) throw new Error("execCommand copy failed")
        }
        ElMessage.success(label)
      } catch {
        ElMessage.error("复制失败，请手动选中复制")
      }
    }

    const allText = computed(() =>
      props.items
        .filter(item => item.value)
        .map(item => `${item.label}: ${item.value}`)
        .join("\n")
    )
    return { ...toRefs(props), props, copyText, allText, computed, Warning, CopyDocument, ElMessage }
  }
})
</script>

<style lang="less" scoped>
.ds-once {
  border: 1px solid var(--ds-warning-border);
  border-radius: var(--ds-radius-md);
  background: var(--ds-neutral-0);
  overflow: hidden;
}

.ds-once__notice {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-space-2);
  padding: var(--ds-space-3) var(--ds-space-5);
  background: var(--ds-warning-bg);
  border-bottom: 1px solid var(--ds-warning-border);
  color: var(--ds-warning-fg);
  font-size: var(--ds-fs-13);
  line-height: var(--ds-lh-body);
}

.ds-once__notice-text { flex: 1 1 auto; min-width: 0; }

.ds-once__copy-all {
  flex: 0 0 auto;
  margin-left: auto;
  border-color: var(--ds-warning-border);
  background: var(--ds-neutral-0);
  color: var(--ds-neutral-900);
}

.ds-once__row {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--ds-space-4);
  padding: var(--ds-space-3) var(--ds-space-5);
  border-bottom: 1px solid var(--ds-border-light);

  &:last-of-type { border-bottom: none; }
}

.ds-once__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ds-once__label {
  font-size: var(--ds-fs-14);
  color: var(--ds-neutral-900);
  font-weight: var(--ds-weight-medium);
}

.ds-once__value {
  display: block;
  padding: var(--ds-space-2) var(--ds-space-3);
  background: var(--ds-neutral-50);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  word-break: break-all;
  user-select: all;
}

.ds-once__foot {
  display: flex;
  justify-content: flex-end;
  gap: var(--ds-space-2);
  padding: var(--ds-space-4) var(--ds-space-5);
  border-top: 1px solid var(--ds-border-light);
  background: var(--ds-neutral-50);
}

@media (max-width: 767px) {
  .ds-once__row {
    grid-template-columns: 1fr;
    gap: var(--ds-space-2);
  }
  .ds-once__foot { flex-wrap: wrap; justify-content: flex-start; }
}
</style>
