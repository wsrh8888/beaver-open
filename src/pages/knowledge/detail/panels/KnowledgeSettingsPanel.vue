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

  知识库设置：基本信息 / 分段与检索参数 / 删除知识库。
  分段与向量模型配置同存 index_config，这里只覆盖自己负责的键，不会动 embedding 凭据。
-->

<template>
  <div class="kb-settings">
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
        <span class="kb-settings__hint">单段最大字符数，越大越省调用、越小越精准</span>
      </el-form-item>
      <el-form-item label="重叠长度">
        <el-input-number v-model="form.overlap" :min="0" :max="1000" :step="10" controls-position="right" />
        <span class="kb-settings__hint">相邻段重叠字符数，避免切断语义</span>
      </el-form-item>
      <el-form-item label="检索条数">
        <el-input-number v-model="form.topK" :min="1" :max="20" controls-position="right" />
        <span class="kb-settings__hint">默认召回 TopK</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </el-form-item>

      <el-divider content-position="left">危险操作</el-divider>
      <el-form-item>
        <el-button type="danger" plain :loading="removing" @click="removeCollection">删除知识库</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { computed, reactive, ref, watch, defineComponent, toRefs } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteKnowledgeBaseApi, saveKnowledgeBaseApi } from "@/api/knowledge"
import type { IKnowledgeBase } from "@/types/api/knowledge"

export default defineComponent({
  name: "KnowledgeSettingsPanel",
  props: {
    collection: { type: Object as PropType<IKnowledgeBase>, required: true }
  },
  emits: ["changed", "removed"],
  setup(props, { emit }) {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

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
        const res = await saveKnowledgeBaseApi({
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

    /* ============ 删除知识库（平台级，影响所有引用它的智能体）============ */
    const removing = ref(false)

    const removeCollection = async () => {
      try {
        await ElMessageBox.confirm(
          "删除后该知识库的文档与索引一并清除，引用过它的智能体也会失去这份知识。",
          `删除知识库「${props.collection.name}」`,
          { type: "warning", confirmButtonText: "删除", cancelButtonText: "取消" }
        )
      } catch {
        return
      }
      removing.value = true
      try {
        const res = await deleteKnowledgeBaseApi({ collectionId: props.collection.collectionId })
        if (res.code !== 0) throw new Error(res.msg || "删除失败")
        ElMessage.success("已删除")
        emit("removed")
      } catch (err) {
        ElMessage.error(errorMessage(err, "删除失败"))
      } finally {
        removing.value = false
      }
    }
    return {
      ...toRefs(props), props, emit, errorMessage, rawConfig, num, form, saving, save,
      removing, removeCollection, computed, reactive, ref, watch, ElMessage, ElMessageBox,
      deleteKnowledgeBaseApi, saveKnowledgeBaseApi
    }
  }
})
</script>

<style scoped lang="less">
.kb-settings {
  max-width: 620px;

  &__hint {
    margin-left: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
