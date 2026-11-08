<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  beaver-open-header-v1

  知识源分区：流程对齐 cloud-console 的 KnowledgeResourcesTab。
  知识库是平台级资源（后台/开放平台同一份数据），数字伙伴只绑定其中的 ID；
  因此这里既能新建知识库、管理文档与召回参数，也能把它绑定给当前数字伙伴。
-->

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { Plus } from "@element-plus/icons-vue"
import { listDigitalKnowledgeApi, saveDigitalKnowledgeApi } from "@/api/digital"
import type { IDigitalKnowledge } from "@/types/api/digital"
import { useDigitalWorkspace } from "../../workspace"
import { iconLetter, iconTint } from "../../../_shared/cardVisual"
import { errorMessage } from "../../../_shared/console"
import KnowledgeDetail from "./knowledge/KnowledgeDetail.vue"

const ws = useDigitalWorkspace()
const { mode, digitalId, config } = ws

const list = ref<IDigitalKnowledge[]>([])
const loading = ref(false)
const activeId = ref("")
const active = computed(() => list.value.find(item => item.collectionId === activeId.value) || null)

const loadList = async () => {
  if (!digitalId.value) {
    list.value = []
    return
  }
  loading.value = true
  try {
    const res = await listDigitalKnowledgeApi({ digitalId: digitalId.value })
    if (res.code !== 0) throw new Error(res.msg || "加载知识源失败")
    list.value = res.result?.list ?? []
  } catch (err) {
    ElMessage.error(errorMessage(err, "加载知识源失败"))
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
    const res = await saveDigitalKnowledgeApi({
      digitalId: digitalId.value,
      name,
      description: form.description.trim() || undefined
    })
    if (res.code !== 0) throw new Error(res.msg || "创建失败")
    const id = res.result?.collectionId ?? ""
    // 服务端建完即绑定本数字伙伴，本地配置同步跟上，免得再点一次「绑定」
    if (id && !config.prompt.knowledgeIds.includes(id)) {
      config.prompt.knowledgeIds = [...config.prompt.knowledgeIds, id]
    }
    createVisible.value = false
    await loadList()
    if (id) activeId.value = id
    ElMessage.success("知识库已创建")
  } catch (err) {
    ElMessage.error(errorMessage(err, "创建失败"))
  } finally {
    creating.value = false
  }
}

const enter = (item: IDigitalKnowledge) => { activeId.value = item.collectionId }

onMounted(loadList)
</script>

<template>
  <div>
    <div v-if="mode !== 'prompt'" class="ds-notice ds-notice--brand">
      <span>
        当前是{{ mode === 'longconnect' ? '长链接接入' : '工作流编排' }}。知识源由平台运行时检索，只在提示词编排下生效；
        切回「提示词编排」即可在这里绑定。
      </span>
    </div>

    <div v-else-if="!digitalId" class="ds-notice ds-notice--brand">
      <span>请先保存智能体，再配置知识源。</span>
    </div>

    <KnowledgeDetail
      v-else-if="active"
      :digital-id="digitalId"
      :collection="active"
      @back="activeId = ''"
      @refresh="loadList"
    />

    <template v-else>
      <div class="ks-head">
        <div>
          <h3 class="ks-head__title">知识源</h3>
          <p class="ks-head__desc">
            知识库由平台统一维护，支持导入文档、自动学习与召回测试。数字伙伴只引用其 ID，
            运行时按绑定关系检索，不复制你的内容。
          </p>
        </div>
        <span class="ds-hint">
          已绑定 {{ list.filter(item => item.bound).length }} / {{ list.length }} 个
        </span>
      </div>

      <div v-loading="loading" class="agent-tools">
        <div class="tool-grid">
          <button type="button" class="tool-card tool-card--entry" @click="openCreate">
            <div class="tool-card__body tool-card__body--entry">
              <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
              <span class="tool-card__entry-label">新建知识库</span>
              <span class="tool-card__entry-hint">建完自动绑定，可再导入文档</span>
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
                <span class="tool-card__icon" :style="{ background: iconTint(item.name) }">
                  {{ iconLetter(item.name) }}
                </span>
                <div class="tool-card__text">
                  <span class="tool-card__title">{{ item.name }}</span>
                  <span class="tool-card__subtitle">
                    {{ item.documentCount }} 篇文档 · 检索 TopK {{ item.topK || "默认" }}
                  </span>
                </div>
                <span class="tool-card__status-dot" :class="item.bound ? 'is-on' : 'is-off'" />
              </div>
              <p class="tool-card__desc">{{ item.description || "暂无描述" }}</p>
            </div>
            <div class="tool-card__foot">
              <span v-if="item.bound" class="tool-card__tag">已绑定</span>
              <span v-else class="tool-card__tag tool-card__tag--off">未绑定</span>
            </div>
          </button>

          <p v-if="!loading && !list.length" class="tool-grid__empty">
            平台还没有知识库，点上方「新建知识库」开始。
          </p>
        </div>
      </div>
    </template>

    <el-dialog v-model="createVisible" width="480px" destroy-on-close class="tool-dialog" append-to-body>
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">新建知识库</h2>
          <p class="tool-dialog-header__sub">建完会自动绑定到当前数字伙伴</p>
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

<style scoped lang="less">
@import "../../../_shared/toolCards.less";

.ks-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  &__title {
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__desc {
    margin: 6px 0 0;
    max-width: 720px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--el-text-color-secondary);
  }
}

.tool-card__tag--off {
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
}

.tool-grid__empty {
  grid-column: 1 / -1;
  padding: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
