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
import { computed, ref, watch } from "vue"
import { useDigitalWorkspace, type DigitalMode } from "../../workspace"
import PromptEditor from "./orchestration/PromptEditor.vue"
import LongConnectionEditor from "./orchestration/LongConnectionEditor.vue"
import WorkflowEditor from "./orchestration/WorkflowEditor.vue"

const ws = useDigitalWorkspace()
const switching = ref(false)

const MODE_OPTIONS: { value: DigitalMode; label: string; desc: string }[] = [
  { value: "prompt", label: "提示词编排", desc: "平台托管运行，在这里配置人设、模型、工具与知识源。" },
  { value: "longconnect", label: "长链接接入", desc: "你自己的服务通过长连接（WebSocket）接入，平台只签发凭据并转发消息。" },
  { value: "workflow", label: "工作流编排", desc: "由工作流节点驱动，多步骤、多分支在下方流程里编排。" }
]

/**
 * 下方面板由本地 mode 驱动：选择后立刻换内容，再等服务端落库。
 * 直接用 ws.mode 的话，切换要等一次「更新 + 重新拉详情」的往返，中途看起来像没生效。
 */
const localMode = ref<DigitalMode>(ws.mode.value)
watch(ws.mode, value => { localMode.value = value })

const currentDesc = computed(() => MODE_OPTIONS.find(item => item.value === localMode.value)?.desc || "")

const onModeChange = async (value: DigitalMode) => {
  if (value === ws.mode.value) return
  const previous = ws.mode.value
  localMode.value = value
  switching.value = true
  try {
    const ok = await ws.switchMode(value)
    if (!ok) localMode.value = previous
  } finally {
    switching.value = false
  }
}
</script>

<template>
  <div>
    <div class="orch-mode">
      <div class="orch-mode__head">
        <span class="orch-mode__label">编排方式</span>
        <el-select
          v-model="localMode"
          :loading="switching"
          class="orch-mode__select"
          @change="onModeChange"
        >
          <el-option
            v-for="option in MODE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <span class="orch-mode__lock">随时可切换，已有配置不会被删除</span>
      </div>
      <p v-if="currentDesc" class="orch-mode__desc">{{ currentDesc }}</p>
    </div>

    <PromptEditor v-if="localMode === 'prompt'" />
    <LongConnectionEditor v-else-if="localMode === 'longconnect'" />
    <WorkflowEditor v-else />
  </div>
</template>

<style lang="less" scoped>
.orch-mode {
  padding: var(--ds-space-4) var(--ds-space-5);
  margin-bottom: var(--ds-space-5);
  background: var(--ds-fill-soft);
  border: 1px solid var(--ds-border-light);
  border-radius: var(--ds-radius-lg);

  &__head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ds-space-3);
  }

  &__label {
    font-size: var(--ds-fs-14);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-neutral-900);
  }

  &__select {
    width: 200px;
  }

  &__lock {
    font-size: var(--ds-fs-12);
    color: var(--ds-neutral-500);
  }

  &__desc {
    margin: var(--ds-space-2) 0 0;
    font-size: var(--ds-fs-13);
    line-height: var(--ds-lh-body);
    color: var(--ds-neutral-600);
  }
}
</style>
