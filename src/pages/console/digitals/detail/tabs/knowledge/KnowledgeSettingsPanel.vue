<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  beaver-open-header-v1

  知识库设置：基本信息 / 分段与检索参数 / 绑定到本数字伙伴 / 删除知识库。
  分段与向量模型配置同存 index_config，这里只覆盖自己负责的键，不会动 embedding 凭据。
-->

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteDigitalKnowledgeApi, saveDigitalKnowledgeApi } from "@/api/digital"
import type { IDigitalKnowledge } from "@/types/api/digital"
import { useDigitalWorkspace } from "../../../workspace"
import { errorMessage } from "../../../../_shared/console"

const props = defineProps<{
  digitalId: string
  collection: IDigitalKnowledge
}>()

const emit = defineEmits<{ changed: []; removed: [] }>()

const ws = useDigitalWorkspace()

const rawConfig = computed<Record<string, unknown>>(() => {
  try {
    const parsed = JSON.parse(props.collection.indexConfig || "{}")
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
})

const num = (value: unknown, fallback: number) =>
  typeof value === "number" && value > 0 ? value : fallback

const form = reactive({
  name: "",
  description: "",
  topK: 5,
  chunkSize: 500,
  overlap: 50
})

watch(
  () => props.collection,
  item => {
    form.name = item.name
    form.description = item.description || ""
    form.topK = item.topK || 5
    form.chunkSize = num(rawConfig.value.chunk_size, 500)
    form.overlap = num(rawConfig.value.overlap, 50)
  },
  { immediate: true, deep: true }
)

const saving = ref(false)

const save = async () => {
  const name = form.name.trim()
  if (!name) {
    ElMessage.warning("名称不能为空")
    return
  }
  if (form.overlap >= form.chunkSize) {
    ElMessage.warning("重叠长度要小于分段长度")
    return
  }
  saving.value = true
  try {
    const res = await saveDigitalKnowledgeApi({
      digitalId: props.digitalId,
      collectionId: props.collection.collectionId,
      name,
      description: form.description.trim(),
      topK: form.topK,
      indexConfig: JSON.stringify({ chunk_size: form.chunkSize, overlap: form.overlap })
    })
    if (res.code !== 0) throw new Error(res.msg || "保存失败")
    ElMessage.success("已保存")
    emit("changed")
  } catch (err) {
    ElMessage.error(errorMessage(err, "保存失败"))
  } finally {
    saving.value = false
  }
}

/* ============ 绑定到本数字伙伴 ============ */
const bound = computed(() => ws.config.prompt.knowledgeIds.includes(props.collection.collectionId))
const binding = ref(false)

const toggleBind = async (value: boolean) => {
  const ids = ws.config.prompt.knowledgeIds
  binding.value = true
  try {
    ws.config.prompt.knowledgeIds = value
      ? [...ids, props.collection.collectionId]
      : ids.filter(id => id !== props.collection.collectionId)
    // 绑定关系存在编排配置里，改完立即落库，不依赖顶部保存按钮
    const ok = await ws.saveConfig()
    if (!ok) {
      ws.config.prompt.knowledgeIds = ids
      return
    }
    ElMessage.success(value ? "已绑定到本数字伙伴" : "已取消绑定")
    emit("changed")
  } finally {
    binding.value = false
  }
}

/* ============ 删除知识库 ============ */
const removing = ref(false)

const removeCollection = async () => {
  try {
    await ElMessageBox.confirm(
      "删除后该知识库的文档与索引一并清除，已绑定它的其它数字伙伴也会失去这份知识。",
      `删除知识库「${props.collection.name}」`,
      { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" }
    )
  } catch {
    return
  }
  removing.value = true
  try {
    const res = await deleteDigitalKnowledgeApi({
      digitalId: props.digitalId,
      collectionId: props.collection.collectionId
    })
    if (res.code !== 0) throw new Error(res.msg || "删除失败")
    ws.config.prompt.knowledgeIds = ws.config.prompt.knowledgeIds.filter(
      id => id !== props.collection.collectionId
    )
    ElMessage.success("已删除")
    emit("removed")
  } catch (err) {
    ElMessage.error(errorMessage(err, "删除失败"))
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div class="ks-settings">
    <el-form label-width="120px" label-position="left">
      <el-divider content-position="left">基本信息</el-divider>
      <el-form-item label="名称">
        <el-input v-model="form.name" maxlength="64" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.description" type="textarea" :rows="2" maxlength="512" />
      </el-form-item>

      <el-divider content-position="left">分段与检索</el-divider>
      <el-form-item label="分段长度">
        <el-input-number v-model="form.chunkSize" :min="100" :max="4000" :step="100" controls-position="right" />
        <span class="ks-settings__hint">单段最大字符数，越大越省调用、越小越精准</span>
      </el-form-item>
      <el-form-item label="重叠长度">
        <el-input-number v-model="form.overlap" :min="0" :max="1000" :step="10" controls-position="right" />
        <span class="ks-settings__hint">相邻段重叠字符数，避免切断语义</span>
      </el-form-item>
      <el-form-item label="检索条数">
        <el-input-number v-model="form.topK" :min="1" :max="20" controls-position="right" />
        <span class="ks-settings__hint">默认召回 TopK</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </el-form-item>

      <el-divider content-position="left">绑定</el-divider>
      <el-form-item label="绑定到本智能体">
        <el-switch :model-value="bound" :loading="binding" @change="(v: string | number | boolean) => toggleBind(Boolean(v))" />
        <span class="ks-settings__hint">
          {{ bound ? "运行时会把这份知识库作为可检索来源" : "未绑定，运行时不会检索它" }}
        </span>
      </el-form-item>

      <el-divider content-position="left">危险操作</el-divider>
      <el-form-item>
        <el-button type="danger" plain :loading="removing" @click="removeCollection">删除知识库</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="less">
.ks-settings {
  max-width: 620px;

  &__hint {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
