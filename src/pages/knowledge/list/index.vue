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

  知识库列表：平台级共享资产。这里只建库、管文档、配检索；
  「知识源」是智能体详情里 open_knowledge_source 表的实体，一个知识源可以引入 N 个知识库，
  两套东西互不混用，知识源不复制这里的任何文档。
-->

<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-header__title">知识库</h1>
        <p class="page-header__desc">
          平台级共享资产：导入文档、配置分段与检索。智能体在「知识源」里可以引入多个知识库，内容不会被复制。
        </p>
      </div>
      <div class="page-header__actions">
        <el-button type="primary" :icon="Plus" @click="openCreate">新建知识库</el-button>
      </div>
    </div>

    <div v-loading="loading" class="agent-tools">
      <div class="tool-grid">
        <button type="button" class="tool-card tool-card--entry" @click="openCreate">
          <div class="tool-card__body tool-card__body--entry">
            <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
            <span class="tool-card__entry-label">新建知识库</span>
            <span class="tool-card__entry-hint">导入文档并配置检索</span>
          </div>
        </button>

        <button
          v-for="item in list"
          :key="item.collectionId"
          type="button"
          class="tool-card"
          @click="enter(item)"
        >
          <div class="tool-card__body">
            <div class="tool-card__row">
              <span class="tool-card__icon" :style="{ background: tint(item.name) }">
                {{ letter(item.name) }}
              </span>
              <div class="tool-card__text">
                <span class="tool-card__title">{{ item.name }}</span>
                <span class="tool-card__subtitle">
                  {{ item.documentCount }} 篇文档 · 检索 TopK {{ item.topK || "默认" }}
                </span>
              </div>
            </div>
            <p class="tool-card__desc">{{ item.description || "暂无描述" }}</p>
          </div>
          <div class="tool-card__foot">
            <span class="tool-card__tag" :class="{ 'kb-tag--off': item.status !== 1 }">
              {{ item.status === 1 ? "启用中" : "已停用" }}
            </span>
          </div>
        </button>

        <p v-if="!loading && !list.length" class="kb-empty">
          还没有知识库，点「新建知识库」导入第一份资料。
        </p>
      </div>
    </div>

    <el-dialog v-model="createVisible" width="480px" destroy-on-close class="tool-dialog" append-to-body>
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">新建知识库</h2>
          <p class="tool-dialog-header__sub">建完可导入文档，再到智能体的「知识源」里引入</p>
        </div>
      </template>
      <el-form label-position="top">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="64" show-word-limit placeholder="例如：售后政策库" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            maxlength="512"
            show-word-limit
            placeholder="这个知识库里放什么资料"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="submitCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { onMounted, reactive, ref, defineComponent } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { listKnowledgeBaseApi, saveKnowledgeBaseApi } from "@/api/knowledge"
import type { IKnowledgeBase } from "@/types/api/knowledge"

export default defineComponent({
  name: "KnowledgeListPage",
  setup() {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const router = useRouter()
    const list = ref<IKnowledgeBase[]>([])
    const loading = ref(false)

    const loadList = async () => {
      loading.value = true
      try {
        const res = await listKnowledgeBaseApi()
        if (res.code !== 0) throw new Error(res.msg || "加载知识库失败")
        list.value = res.result?.list ?? []
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载知识库失败"))
      } finally {
        loading.value = false
      }
    }

    /* ============ 新建知识库 ============ */
    const createVisible = ref(false)
    const creating = ref(false)
    const form = reactive({ name: "", description: "" })

    const openCreate = () => {
      form.name = ""
      form.description = ""
      createVisible.value = true
    }

    const submitCreate = async () => {
      const name = form.name.trim()
      if (!name) {
        ElMessage.warning("请填写知识库名称")
        return
      }
      creating.value = true
      try {
        const res = await saveKnowledgeBaseApi({ name, description: form.description.trim() || undefined })
        if (res.code !== 0) throw new Error(res.msg || "创建失败")
        createVisible.value = false
        ElMessage.success("知识库已创建")
        await loadList()
      } catch (err) {
        ElMessage.error(errorMessage(err, "创建失败"))
      } finally {
        creating.value = false
      }
    }

    const enter = (item: IKnowledgeBase) => router.push(`/knowledge/${item.collectionId}`)

    /* ============ 卡片视觉（本板块自用，不跨板块抽离）============ */
    const PALETTE = ["#e8f0fe", "#e9f7ef", "#fdf1e3", "#f3ecfb", "#e6f6f7"]
    const tint = (name: string) => PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length]
    const letter = (name: string) => (name.trim()[0] || "库").toUpperCase()

    onMounted(loadList)
    return {
      errorMessage, router, list, loading, loadList, createVisible, creating, form,
      openCreate, submitCreate, enter, PALETTE, tint, letter, onMounted, reactive, ref,
      useRouter, ElMessage, Plus, listKnowledgeBaseApi, saveKnowledgeBaseApi
    }
  }
})
</script>

<style scoped lang="less">
@import "../components/toolCards.less";

.kb-tag--off {
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
}

.kb-empty {
  grid-column: 1 / -1;
  padding: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
