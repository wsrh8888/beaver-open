<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  beaver-open-header-v1

  召回测试：按当前知识库实际检索一次，看命中片段与相关度。
  未配置向量模型 / 无命中时服务端会回 notice，这里如实展示，不做假数据。
-->

<script setup lang="ts">
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { retrieveDigitalKnowledgeApi } from "@/api/digital"
import type { IDigitalKnowledgeHit } from "@/types/api/digital"
import { errorMessage } from "../../../../_shared/console"

const props = defineProps<{
  digitalId: string
  collectionId: string
  topK: number
}>()

const query = ref("")
const topK = ref(props.topK || 5)
const loading = ref(false)
const tested = ref(false)
const hits = ref<IDigitalKnowledgeHit[]>([])
const notice = ref("")

const run = async () => {
  const text = query.value.trim()
  if (!text) {
    ElMessage.warning("请输入测试问题")
    return
  }
  loading.value = true
  tested.value = false
  try {
    const res = await retrieveDigitalKnowledgeApi({
      digitalId: props.digitalId,
      collectionId: props.collectionId,
      query: text,
      topK: topK.value
    })
    if (res.code !== 0) throw new Error(res.msg || "召回失败")
    hits.value = res.result?.hits ?? []
    notice.value = res.result?.notice ?? ""
    tested.value = true
  } catch (err) {
    ElMessage.error(errorMessage(err, "召回失败"))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="retrieve-block">
    <el-form label-width="88px" label-position="left" size="default">
      <el-form-item label="检索条数">
        <el-input-number v-model="topK" :min="1" :max="20" controls-position="right" />
      </el-form-item>
      <el-form-item label="测试问题">
        <el-input v-model="query" type="textarea" :rows="4" placeholder="例如：退款多久到账？" />
      </el-form-item>
    </el-form>
    <el-button type="primary" :loading="loading" @click="run">运行召回</el-button>

    <el-table v-if="hits.length" :data="hits" size="small" class="retrieve-table" max-height="360">
      <el-table-column prop="title" label="文档" width="140" show-overflow-tooltip />
      <el-table-column prop="score" label="相关度" width="90">
        <template #default="{ row }">{{ row.score.toFixed(3) }}</template>
      </el-table-column>
      <el-table-column prop="content" label="片段" show-overflow-tooltip />
    </el-table>
    <p v-else-if="tested" class="retrieve-empty">
      {{ notice || "无命中" }}
    </p>
    <p v-else class="retrieve-hint">
      召回走的是与线上一致的分段与向量配置；结果为空通常意味着文档没学完，或该问题与知识库无关。
    </p>
  </div>
</template>

<style scoped lang="less">
.retrieve-block {
  max-width: 760px;
}

.retrieve-table {
  margin-top: 16px;
}

.retrieve-empty {
  margin-top: 16px;
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.retrieve-hint {
  margin-top: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
</style>
