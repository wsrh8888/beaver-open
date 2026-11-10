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
  <div>
    <div class="ds-notice ds-notice--brand">
      <span>
        长链接接入用于对接第三方服务：你自己的服务通过 WebSocket 长连接接入平台，
        平台只负责签发凭据并转发消息，不托管对话逻辑，所以这里没有可配置项。
        接入所需的 AppKey / AppSecret 与重置，请在「开发者选项」分区查看。
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"


export default defineComponent({
  name: "LongConnectionEditor",
  setup() {
    // no setup state
    return {  }
  }
})
</script>
