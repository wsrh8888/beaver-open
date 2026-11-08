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
import { EditPen } from "@element-plus/icons-vue"
</script>

<template>
  <div>
    <div class="ds-notice ds-notice--brand" style="margin-bottom: var(--ds-space-5)">
      <el-icon><EditPen /></el-icon>
      <span>
        工作流编排能力建设中：节点画布与连线编辑器尚未上线。当前可先创建「工作流编排」类型的智能体，
        待编辑器就绪后即可在此配置节点与流转。本分区保存仅落库运行方式，不影响其它分区。
      </span>
    </div>

    <div class="wf-placeholder">
      <div class="wf-placeholder__icon"><el-icon><EditPen /></el-icon></div>
      <p class="wf-placeholder__title">工作流编辑器即将到来</p>
      <p class="wf-placeholder__desc">
        你将能在这里用可视化节点编排智能体的对话与执行流程，并复用「工具」分区里的能力。
      </p>
    </div>
  </div>
</template>

<style lang="less" scoped>
.wf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-10) var(--ds-space-5);
  text-align: center;
  background: var(--ds-fill-soft);
  border: 1px dashed var(--ds-border);
  border-radius: var(--ds-radius-lg);

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--ds-brand-50);
    color: var(--ds-brand);
    font-size: 24px;
  }

  &__title {
    margin: var(--ds-space-2) 0 0;
    font-size: var(--ds-fs-16);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-neutral-900);
  }

  &__desc {
    margin: 0;
    max-width: 420px;
    font-size: var(--ds-fs-13);
    line-height: var(--ds-lh-body);
    color: var(--ds-neutral-600);
  }
}
</style>
