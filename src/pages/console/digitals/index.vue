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
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { Plus, Right } from "@element-plus/icons-vue"
import { createDigitalApi, listDigitalsApi } from "@/api/digital"
import type { IDigitalInfo } from "@/types/api/digital"
import { errorMessage } from "../_shared/console"
import { iconColorFor, iconLetter, iconTint } from "../_shared/cardVisual"

const router = useRouter()
const loading = ref(false)
const loadFailed = ref(false)
const list = ref<IDigitalInfo[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

const loadList = async () => {
  loading.value = true
  loadFailed.value = false
  try {
    const res = await listDigitalsApi({ page: page.value, pageSize: pageSize.value })
    list.value = res?.result?.list ?? []
    total.value = res?.result?.total ?? 0
  } catch {
    loadFailed.value = true
    ElMessage.error("加载智能体失败")
  } finally {
    loading.value = false
  }
}

const goDetail = (row: IDigitalInfo) => router.push(`/console/digitals/${row.digitalId}?tab=orchestration`)

const emptyText = computed(() =>
  loadFailed.value ? "加载失败，请重新进入本页" : "还没有智能体，先创建一个"
)

/* ============ 创建弹窗 ============
 * 弹窗里填完基础信息直接落库（一步创建），不再进「草稿态工作台」。
 * 编排方式不在这里定：它随时可改（编排分区里切换），少一个必须先做的决定。
 */
const dialogVisible = ref(false)
const submitting = ref(false)
const createForm = reactive<{ name: string; description: string; avatar: string }>({
  name: "",
  description: "",
  avatar: ""
})

const openCreate = () => {
  createForm.name = ""
  createForm.description = ""
  createForm.avatar = ""
  dialogVisible.value = true
}

const submitCreate = async () => {
  const name = createForm.name.trim()
  if (name.length < 2 || name.length > 50) {
    ElMessage.warning("名称需 2-50 个字符")
    return
  }
  submitting.value = true
  try {
    const res = await createDigitalApi({
      name,
      description: createForm.description.trim() || undefined,
      avatar: createForm.avatar.trim() || undefined,
      runtime: "builtin",
      visibility: "private"
    })
    if (res.code !== 0) throw new Error(res.msg || "创建失败")
    const id = res.result?.digitalId ?? ""
    if (!id) throw new Error("创建失败：未返回 digitalId")
    dialogVisible.value = false
    ElMessage.success("智能体已保存")
    router.push(`/console/digitals/${id}?tab=orchestration`)
  } catch (err) {
    ElMessage.error(errorMessage(err, "保存失败"))
  } finally {
    submitting.value = false
  }
}

onMounted(loadList)
</script>

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-header__title">智能体</h1>
        <p class="page-header__desc">可被拉入会话的数字伙伴。创建后在同一个工作台里配置编排、知识源与工具。</p>
      </div>
      <div class="page-header__actions">
        <span class="ds-hint">共 {{ total }} 个智能体</span>
        <el-button type="primary" :icon="Plus" @click="openCreate">创建智能体</el-button>
      </div>
    </div>

    <div class="ds-list-panel">
      <div v-loading="loading" class="digital-grid">
        <article
          v-for="item in list"
          :key="item.digitalId"
          class="digital-card"
          role="button"
          tabindex="0"
          @click="goDetail(item)"
          @keyup.enter="goDetail(item)"
        >
          <header class="digital-card__head">
            <img v-if="item.avatar" class="digital-card__avatar digital-card__avatar--img" :src="item.avatar" :alt="item.name">
            <div
              v-else
              class="digital-card__avatar"
              :style="{ background: iconTint(item.name), color: iconColorFor(item.name) }"
            >
              {{ iconLetter(item.name) }}
            </div>
            <div class="digital-card__heading">
              <h3 class="digital-card__name" :title="item.name">{{ item.name }}</h3>
              <p v-if="item.workId" class="digital-card__workid">工号 {{ item.workId }}</p>
            </div>
            <span
              class="ds-badge"
              :class="item.status === 0 ? 'ds-badge--neutral' : 'ds-badge--success'"
            >
              {{ item.status === 0 ? "未发布" : "已发布" }}
            </span>
          </header>

          <p class="digital-card__desc">{{ item.description || "暂无描述" }}</p>

          <footer class="digital-card__stats">
            <span class="digital-card__stat"><b>{{ item.toolCount ?? 0 }}</b> 工具</span>
            <span class="digital-card__stat"><b>{{ item.knowledgeCount ?? 0 }}</b> 知识库</span>
            <span class="digital-card__stat"><b>{{ item.mcpCount ?? 0 }}</b> MCP</span>
            <el-icon class="digital-card__go"><Right /></el-icon>
          </footer>
        </article>

        <div v-if="!loading && !list.length" class="digital-empty">
          <p>{{ emptyText }}</p>
          <el-button v-if="!loadFailed" type="primary" @click="openCreate">创建智能体</el-button>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="total > pageSize"
      v-model:current-page="page"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[12, 24, 48, 100]"
      layout="total, sizes, prev, pager, next"
      class="ds-pagination"
      @current-change="loadList"
      @size-change="loadList"
    />

    <el-dialog
      v-model="dialogVisible"
      title="创建智能体"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="createForm" label-width="72px" @submit.prevent>
        <el-form-item label="名称" required>
          <el-input
            v-model="createForm.name"
            maxlength="50"
            show-word-limit
            placeholder="例如：售后助手"
            @keyup.enter="submitCreate"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            maxlength="512"
            show-word-limit
            placeholder="一句话说明这个智能体负责什么"
          />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="createForm.avatar" placeholder="可选，填写完整图片地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCreate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less" scoped>
.page-header__actions {
  align-items: center;
}

.digital-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: var(--ds-space-4);
  align-content: start;
  min-height: 160px;
}

.digital-card {
  display: flex;
  flex-direction: column;
  padding: var(--ds-space-4) var(--ds-space-5) 0;
  background: var(--ds-neutral-0);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover,
  &:focus-visible {
    border-color: var(--ds-brand);
    box-shadow: 0 6px 18px rgb(191 74 27 / 10%);
    outline: none;

    .digital-card__go { opacity: 1; transform: translateX(0); }
  }

  &__head {
    display: flex;
    align-items: center;
    gap: var(--ds-space-3);
  }

  &__avatar {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: var(--ds-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--ds-weight-bold);
    font-size: var(--ds-fs-16);
    overflow: hidden;

    &--img { object-fit: cover; background: var(--ds-neutral-100); }
  }

  &__heading {
    min-width: 0;
    flex: 1 1 auto;
  }

  &__name {
    margin: 0;
    font-size: var(--ds-fs-16);
    font-weight: var(--ds-weight-bold);
    line-height: 22px;
    color: var(--ds-neutral-900);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__workid {
    margin: 2px 0 0;
    font-size: var(--ds-fs-12);
    color: var(--ds-neutral-400);
    font-family: var(--ds-font-mono);
  }

  &__desc {
    margin: var(--ds-space-3) 0 var(--ds-space-4);
    font-size: var(--ds-fs-13);
    line-height: var(--ds-lh-body);
    color: var(--ds-neutral-600);
    min-height: 40px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__stats {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: var(--ds-space-4);
    padding: var(--ds-space-3) 0;
    border-top: 1px solid var(--ds-border-light);
    font-size: var(--ds-fs-12);
    color: var(--ds-neutral-600);

    b {
      font-weight: var(--ds-weight-medium);
      color: var(--ds-neutral-900);
    }
  }

  &__stat { white-space: nowrap; }

  &__go {
    margin-left: auto;
    font-size: 14px;
    color: var(--ds-brand);
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.2s,
      transform 0.2s;
  }
}

.digital-empty {
  grid-column: 1 / -1;
  padding: var(--ds-space-12) 0;
  text-align: center;
  color: var(--ds-neutral-600);
  font-size: var(--ds-fs-14);

  p { margin-bottom: var(--ds-space-4); }
}

@media (max-width: 767px) {
  .digital-grid { grid-template-columns: 1fr; }
}
</style>
