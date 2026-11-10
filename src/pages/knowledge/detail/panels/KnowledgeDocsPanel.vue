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

  知识库文档：列表 + 导入纯文本文档 + 更新学习 + 删除。
  索引状态由平台 worker 异步推进（pending → indexing → ready/failed），有任务在学时自动轮询。
-->

<template>
  <div>
    <div class="panel-toolbar">
      <el-input
        v-model="keyword"
        size="small"
        clearable
        placeholder="搜索标题"
        class="panel-toolbar__search"
        :prefix-icon="Search"
        @clear="loadDocs()"
        @keyup.enter="loadDocs()"
      />
      <el-button size="small" type="primary" @click="openAdd">导入文档</el-button>
    </div>

    <el-table v-loading="loading" :data="docs" size="default" empty-text="暂无文档，先导入一份">
      <el-table-column type="index" label="序号" width="64" align="center" />
      <el-table-column prop="title" label="名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="学习时间" width="150">
        <template #default="{ row }">{{ learningTime(row) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag
            size="small"
            :type="statusType(row.indexStatus)"
            :class="{ 'is-clickable': row.indexStatus === 'failed' }"
            @click="showFailure(row)"
          >
            {{ statusLabel(row.indexStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="72" align="center" fixed="right">
        <template #default="{ row }">
          <el-dropdown trigger="click" @command="(cmd: string) => onCommand(cmd, row)">
            <el-button link type="primary" class="doc-menu-trigger">···</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="reindex" :disabled="reindexingId === row.documentId">
                  更新学习
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="addVisible" width="560px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">导入文档</h2>
          <p class="tool-dialog-header__sub">粘贴纯文本正文，平台会切分并建立向量索引</p>
        </div>
      </template>
      <el-form label-position="top">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" maxlength="120" placeholder="例如：退款政策说明" />
        </el-form-item>
        <el-form-item label="正文" required>
          <el-input
            v-model="form.contentText"
            type="textarea"
            :rows="10"
            placeholder="粘贴或输入文档正文"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitAdd">导入并学习</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { computed, onMounted, onUnmounted, reactive, ref, defineComponent, toRefs } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Search } from "@element-plus/icons-vue"
import {
  deleteKnowledgeDocApi, listKnowledgeDocApi, saveKnowledgeDocApi
} from "@/api/knowledge"
import type { IKnowledgeDoc } from "@/types/api/knowledge"

export default defineComponent({
  name: "KnowledgeDocsPanel",
  props: {
    collectionId: { type: String, required: true }
  },
  emits: ["changed"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const docs = ref<IKnowledgeDoc[]>([])
    const loading = ref(false)
    const keyword = ref("")
    let timer: ReturnType<typeof setInterval> | null = null

    const loadDocs = async (silent = false) => {
      if (!props.collectionId) return
      if (!silent) loading.value = true
      try {
        const res = await listKnowledgeDocApi({
          collectionId: props.collectionId,
          keyword: keyword.value.trim() || undefined
        })
        if (res.code !== 0) throw new Error(res.msg || "加载文档失败")
        docs.value = res.result?.list ?? []
      } catch (err) {
        if (!silent) ElMessage.error(errorMessage(err, "加载文档失败"))
      } finally {
        if (!silent) loading.value = false
      }
    }

    const hasRunning = computed(() =>
      docs.value.some(item => item.indexStatus === "pending" || item.indexStatus === "indexing")
    )

    const startPoll = () => {
      if (timer) clearInterval(timer)
      timer = setInterval(() => {
        if (hasRunning.value) void loadDocs(true)
      }, 4000)
    }

    onMounted(async () => {
      await loadDocs()
      startPoll()
    })

    onUnmounted(() => { if (timer) clearInterval(timer) })

    /* ============ 新增文档 ============ */
    const addVisible = ref(false)
    const saving = ref(false)
    const form = reactive({ title: "", contentText: "" })

    const openAdd = () => {
      form.title = ""
      form.contentText = ""
      addVisible.value = true
    }

    const submitAdd = async () => {
      const title = form.title.trim()
      const contentText = form.contentText.trim()
      if (!title) { ElMessage.warning("请填写标题"); return }
      if (!contentText) { ElMessage.warning("请粘贴正文"); return }
      saving.value = true
      try {
        const res = await saveKnowledgeDocApi({
          collectionId: props.collectionId,
          title,
          contentText
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        ElMessage.success("已导入，平台开始学习")
        addVisible.value = false
        await loadDocs()
        emit("changed")
      } catch (err) {
        ElMessage.error(errorMessage(err, "保存失败"))
      } finally {
        saving.value = false
      }
    }

    /* ============ 更新学习 / 删除 ============ */
    const reindexingId = ref("")

    const reindex = async (row: IKnowledgeDoc) => {
      reindexingId.value = row.documentId
      try {
        const res = await saveKnowledgeDocApi({
          documentId: row.documentId,
          title: row.title,
          reindex: true
        })
        if (res.code !== 0) throw new Error(res.msg || "操作失败")
        ElMessage.success("已开始重新学习")
        await loadDocs(true)
      } catch (err) {
        ElMessage.error(errorMessage(err, "操作失败"))
      } finally {
        reindexingId.value = ""
      }
    }

    const remove = async (row: IKnowledgeDoc) => {
      try {
        await ElMessageBox.confirm(`删除文档「${row.title}」？其学习成果会一并清除。`, "删除文档", { type: "warning" })
      } catch {
        return
      }
      try {
        const res = await deleteKnowledgeDocApi({ documentId: row.documentId })
        if (res.code !== 0) throw new Error(res.msg || "删除失败")
        ElMessage.success("已删除")
        await loadDocs()
        emit("changed")
      } catch (err) {
        ElMessage.error(errorMessage(err, "删除失败"))
      }
    }

    const onCommand = (command: string, row: IKnowledgeDoc) => {
      if (command === "reindex") return void reindex(row)
      if (command === "delete") return void remove(row)
    }

    /* ============ 展示 ============ */
    const statusLabel = (status?: string) => {
      switch (status) {
        case "ready": return "已完成"
        case "indexing": return "学习中"
        case "failed": return "失败"
        default: return "待学习"
      }
    }

    const statusType = (status?: string) => {
      switch (status) {
        case "ready": return "success"
        case "indexing": return "warning"
        case "failed": return "danger"
        default: return "info"
      }
    }

    const showFailure = (row: IKnowledgeDoc) => {
      if (row.indexStatus !== "failed") return
      ElMessageBox.alert(row.indexError?.trim() || "未记录具体原因，可点「更新学习」重试。", "学习失败原因", {
        confirmButtonText: "知道了",
        type: "error"
      })
    }

    const learningTime = (row: IKnowledgeDoc) => {
      if (!row.indexedAt) return "—"
      const date = new Date(row.indexedAt * 1000)
      const pad = (n: number) => String(n).padStart(2, "0")
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    }
    return {
      ...toRefs(props), props, emit, errorMessage, docs, loading, keyword, timer, loadDocs,
      hasRunning, startPoll, addVisible, saving, form, openAdd, submitAdd, reindexingId,
      reindex, remove, onCommand, statusLabel, statusType, showFailure, learningTime,
      computed, onMounted, onUnmounted, reactive, ref, ElMessage, ElMessageBox, Search,
      deleteKnowledgeDocApi, listKnowledgeDocApi, saveKnowledgeDocApi
    }
  }
})
</script>

<style scoped lang="less">
.panel-toolbar {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 12px;

  &__search {
    max-width: 240px;
    margin-right: auto;
  }
}

.doc-menu-trigger {
  font-size: 16px;
  letter-spacing: 1px;
}

.is-clickable {
  cursor: pointer;
}
</style>
