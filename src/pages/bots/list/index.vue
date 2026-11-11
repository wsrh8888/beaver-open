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

  推送机器人列表：与智能体列表同一套卡片布局。
  卡片首位是虚线入口卡，点它弹窗填名称 + 描述，确认后直接落库并进入开发者选项
  （Webhook URL / Token / 签名密钥只在创建时明文一次，必须当场展示）。
-->

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-header__title">推送机器人</h1>
        <p class="page-header__desc">通过 Webhook 向群内单向推送通知，不能对话。</p>
      </div>
    </div>

    <div class="ds-list-panel">
      <div v-loading="loading" class="bot-grid">
        <button type="button" class="bot-card bot-card--entry" @click="openCreate">
          <span class="bot-card__entry-icon">
            <el-icon><Plus /></el-icon>
          </span>
          <span class="bot-card__entry-title">创建推送机器人</span>
          <span class="bot-card__entry-desc">填名称即可，接入凭据创建后生成</span>
        </button>

        <article
          v-for="item in list"
          :key="item.botId"
          class="bot-card"
          role="button"
          tabindex="0"
          @click="goDetail(item)"
          @keyup.enter="goDetail(item)"
        >
          <header class="bot-card__head">
            <img v-if="item.avatar" class="bot-card__avatar bot-card__avatar--img" :src="item.avatar" :alt="item.name">
            <div
              v-else
              class="bot-card__avatar"
              :style="{ background: iconTint(item.name), color: iconColorFor(item.name) }"
            >
              {{ iconLetter(item.name) }}
            </div>
            <div class="bot-card__heading">
              <h3 class="bot-card__name" :title="item.name">{{ item.name }}</h3>
              <p class="bot-card__botid">{{ item.botId }}</p>
            </div>
            <span class="ds-badge ds-badge--neutral">{{ visibilityText(item.visibility) }}</span>
          </header>

          <p class="bot-card__desc">{{ item.description || "暂无描述" }}</p>

          <footer class="bot-card__stats">
            <span class="bot-card__stat">创建于 {{ formatDate(item.createdAt) }}</span>
            <el-icon class="bot-card__go"><Right /></el-icon>
          </footer>
        </article>

        <div v-if="!loading && !list.length" class="bot-empty">
          <p>{{ emptyText }}</p>
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
      title="创建推送机器人"
      width="480px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form :model="createForm" label-width="64px" @submit.prevent>
        <el-form-item label="名称" required>
          <el-input
            v-model="createForm.name"
            maxlength="50"
            show-word-limit
            placeholder="例如：发布通知"
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
            placeholder="一句话说明这个机器人推送什么"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitCreate">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { Plus, Right } from "@element-plus/icons-vue"
import { createBotApi, listBotsApi } from "@/api/bot"
import type { IBotInfo } from "@/types/api/bot"
import { iconColorFor, iconLetter, iconTint } from "@/pages/digitals/components/cardVisual"
import { setBotCredentialFlash } from "@/pages/bots/credentialFlash"

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

function formatDate(value?: number): string {
  if (!value) return "—"
  const ms = value < 1e12 ? value * 1000 : value
  return new Date(ms).toLocaleDateString("zh-CN")
}

function visibilityText(value?: string): string {
  if (value === "public") return "公开"
  if (value === "partial") return "部分公开"
  return "非公开"
}

const router = useRouter()
const loading = ref(false)
const loadFailed = ref(false)
const list = ref<IBotInfo[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(12)

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

const goDetail = (item: IBotInfo) => router.push(`/bots/${item.botId}?tab=settings`)
const emptyText = computed(() =>
  loadFailed.value ? "加载失败，请重新进入本页" : "还没有推送机器人"
)

const dialogVisible = ref(false)
const submitting = ref(false)
const createForm = reactive({ name: "", description: "" })

function openCreate() {
  createForm.name = ""
  createForm.description = ""
  dialogVisible.value = true
}

/**
 * 创建即落库，不再走两步向导：凭据一次性的部分交给开发者分区的 flash 展示。
 * Token / 签名密钥只在这一刻能拿到明文，所以创建完直接把人带到开发者选项。
 */
async function submitCreate() {
  const name = createForm.name.trim()
  if (name.length < 2 || name.length > 50) {
    ElMessage.warning("名称需 2-50 个字符")
    return
  }
  submitting.value = true
  try {
    const res = await createBotApi({
      name,
      description: createForm.description.trim() || undefined,
      visibility: "private"
    })
    if (res.code !== 0) throw new Error(res.msg || "创建失败")
    const botId = res.result?.botId ?? ""
    if (!botId) throw new Error("创建失败：未返回 botId")
    setBotCredentialFlash(botId, {
      webhookUrl: res.result?.webhookUrl ?? "",
      token: res.result?.token ?? "",
      secret: res.result?.secret ?? ""
    })
    dialogVisible.value = false
    router.push(`/bots/${botId}?tab=developer`)
  } catch (err) {
    ElMessage.error(errorMessage(err, "创建失败"))
  } finally {
    submitting.value = false
  }
}

onMounted(loadList)
</script>

<style lang="less" scoped>
.bot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: var(--ds-space-4);
  align-content: start;
  min-height: 160px;
}

.bot-card {
  display: flex;
  flex-direction: column;
  padding: var(--ds-space-4) var(--ds-space-5) 0;
  background: var(--ds-neutral-0);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  font-family: inherit;
  text-align: left;
  color: inherit;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;

  &:hover,
  &:focus-visible {
    border-color: var(--ds-brand);
    box-shadow: 0 6px 18px rgb(191 74 27 / 10%);
    outline: none;

    .bot-card__go { opacity: 1; transform: translateX(0); }
  }

  &--entry {
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 168px;
    padding: var(--ds-space-5);
    border-style: dashed;
    background: transparent;
    color: var(--ds-neutral-600);

    &:hover {
      color: var(--ds-brand);
      border-color: var(--ds-brand);
      background: var(--ds-neutral-0);
    }
  }

  &__entry-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-bottom: 2px;
    border-radius: var(--ds-radius-md);
    background: var(--ds-neutral-100);
    font-size: 18px;
  }

  &__entry-title {
    font-size: var(--ds-fs-14);
    font-weight: var(--ds-weight-medium);
  }

  &__entry-desc {
    font-size: var(--ds-fs-12);
    color: var(--ds-neutral-500);
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

  &__botid {
    margin: 2px 0 0;
    font-size: var(--ds-fs-12);
    color: var(--ds-neutral-400);
    font-family: var(--ds-font-mono);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

.bot-empty {
  grid-column: 1 / -1;
  padding: var(--ds-space-12) 0;
  text-align: center;
  color: var(--ds-neutral-600);
  font-size: var(--ds-fs-14);
}

@media (max-width: 767px) {
  .bot-grid { grid-template-columns: 1fr; }
}
</style>
