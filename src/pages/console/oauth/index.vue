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
import { getOAuthAppListApi } from "@/api/oauth"
import type { IOAuthAppInfo } from "@/types/api/oauth"
import { formatTime } from "../_shared/console"

const router = useRouter()
const loading = ref(false)
const loadFailed = ref(false)
const list = ref<IOAuthAppInfo[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref("")
const statusFilter = ref<number | undefined>(undefined)

// 服务端 list 只支持 page / pageSize / status，名称筛选仅作用于当前页
const visibleList = computed(() => {
  const key = keyword.value.trim().toLowerCase()
  if (!key) return list.value
  return list.value.filter(item => item.name.toLowerCase().includes(key))
})
const hasFilter = computed(() => !!keyword.value.trim() || statusFilter.value !== undefined)

const loadList = async () => {
  loading.value = true
  loadFailed.value = false
  try {
    const res = await getOAuthAppListApi({
      page: page.value,
      pageSize: pageSize.value,
      status: statusFilter.value
    })
    list.value = res?.result?.list ?? []
    total.value = res?.result?.total ?? 0
  } catch {
    loadFailed.value = true
    ElMessage.error("加载 OAuth 应用失败")
  } finally {
    loading.value = false
  }
}

const goCreate = () => router.push("/console/oauth/create")
const goDetail = (row: IOAuthAppInfo) => router.push(`/console/oauth/${row.oauthId}?tab=overview`)

onMounted(loadList)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-header__title">OAuth 登录</h1>
        <p class="page-header__desc">管理 OAuth 应用、凭证、权限范围与各端接入配置。</p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" @click="goCreate">创建 OAuth 应用</el-button>
      </div>
    </div>

    <div class="ds-list-panel">
      <div class="ds-toolbar">
        <el-input v-model="keyword" placeholder="按名称筛选（当前页）" clearable style="width: 220px" />
        <el-select v-model="statusFilter" placeholder="全部状态" clearable style="width: 140px" @change="loadList">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button @click="loadList">刷新</el-button>
      </div>

      <el-table v-loading="loading" :data="visibleList" row-key="oauthId">
        <el-table-column label="名称" min-width="170">
          <template #default="{ row }">
            <el-button link type="primary" @click="goDetail(row)">{{ row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="oauthId" label="OAuth ID" min-width="190">
          <template #default="{ row }"><span class="ds-mono">{{ row.oauthId }}</span></template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="ds-badge" :class="row.status === 1 ? 'ds-badge--success' : 'ds-badge--neutral'">
              {{ row.status === 1 ? "启用" : "禁用" }}
            </span>
          </template>
        </el-table-column>
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
            <p>{{ loadFailed ? "加载失败，请刷新重试" : hasFilter ? "没有符合条件的应用" : "还没有 OAuth 应用" }}</p>
            <div v-if="!hasFilter && !loadFailed" class="ds-empty__action">
              <el-button type="primary" @click="goCreate">创建 OAuth 应用</el-button>
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
