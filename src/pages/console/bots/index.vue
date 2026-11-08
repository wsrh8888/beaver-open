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
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { listBotsApi } from "@/api/bot"
import type { IBotInfo } from "@/types/api/bot"
import { formatTime, visibilityText } from "../_shared/console"

const router = useRouter()
const loading = ref(false)
const loadFailed = ref(false)
const list = ref<IBotInfo[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

const loadList = async () => {
  loading.value = true
  loadFailed.value = false
  try {
    const res = await listBotsApi({ page: page.value, pageSize: pageSize.value })
    list.value = res?.result?.list ?? []
    total.value = res?.result?.total ?? 0
  } catch {
    loadFailed.value = true
    ElMessage.error("加载推送机器人失败")
  } finally {
    loading.value = false
  }
}

const goCreate = () => router.push("/console/bots/create")
const goDetail = (row: IBotInfo) => router.push(`/console/bots/${row.botId}?tab=overview`)
const emptyText = computed(() => loadFailed.value ? "加载失败，请刷新重试" : "还没有推送机器人")

onMounted(loadList)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-header__title">推送机器人</h1>
        <p class="page-header__desc">通过 Incoming Webhook 向群内推送通知。创建只填名称，其余在详情页配置。</p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" @click="goCreate">创建推送机器人</el-button>
      </div>
    </div>

    <div class="ds-list-panel">
      <div class="ds-toolbar">
        <el-button @click="loadList">刷新</el-button>
        <span class="ds-hint">共 {{ total }} 个机器人</span>
      </div>

      <el-table v-loading="loading" :data="list" row-key="botId">
        <el-table-column label="名称" min-width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row)">{{ row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="botId" label="Bot ID" min-width="190">
          <template #default="{ row }"><span class="ds-mono">{{ row.botId }}</span></template>
        </el-table-column>
        <el-table-column label="可见性" width="110">
          <template #default="{ row }">
            <span class="ds-badge ds-badge--neutral">{{ visibilityText(row.visibility) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="创建时间" width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row)">管理</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="ds-empty">
            <p>{{ emptyText }}</p>
            <div v-if="!loadFailed" class="ds-empty__action">
              <el-button type="primary" @click="goCreate">创建推送机器人</el-button>
            </div>
          </div>
        </template>
      </el-table>

      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, prev, pager, next, sizes"
        class="ds-pagination"
        @current-change="loadList"
        @size-change="loadList"
      />
    </div>
  </div>
</template>
