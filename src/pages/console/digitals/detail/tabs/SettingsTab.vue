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
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import {
  deleteDigitalApi,
  setDigitalAdminsApi,
  setDigitalViewersApi,
  updateDigitalApi
} from "@/api/digital"
import { useDigitalWorkspace } from "../../workspace"
import FormCard from "../../../_shared/FormCard.vue"
import IdTagsEditor from "../../../_shared/IdTagsEditor.vue"
import { errorMessage } from "../../../_shared/console"

const ws = useDigitalWorkspace()
const { isNew, draft, digital, digitalId } = ws
const router = useRouter()

const saving = ref(false)
const applying = ref(false)
const deleting = ref(false)

const admins = ref<string[]>([...(digital.value?.adminIds ?? [])])
const viewers = ref<string[]>([...(digital.value?.viewerIds ?? [])])

// 可见范围口径按产品叫法：非公开 / 部分人 / 公开（服务端 oneof=private partial public）
const VISIBILITY_CHOICES = [
  { value: "private", label: "非公开", desc: "仅管理员可搜索和使用" },
  { value: "partial", label: "部分人", desc: "只有指定的可见人可以使用" },
  { value: "public", label: "公开", desc: "全站可搜索、可被拉入会话" }
] as const

const showViewers = computed(() => draft.visibility === "partial")

/** 申请平台分配工号：服务端生成 DG + 6 位数字，全局唯一。 */
const applyWorkId = async () => {
  if (!digitalId.value) return
  applying.value = true
  try {
    const res = await updateDigitalApi({ digitalId: digitalId.value, applyWorkId: true })
    if (res.code !== 0) throw new Error(res.msg || "申请失败")
    ElMessage.success("工号已分配")
    await ws.refresh()
    draft.workId = digital.value?.workId || ""
  } catch (err) {
    ElMessage.error(errorMessage(err, "申请工号失败"))
  } finally {
    applying.value = false
  }
}

/**
 * 一次保存：基础信息 + 可见人 + 管理员。
 * 三个接口分开调（服务端就是这样拆的），任一失败即中止并提示，避免半保存。
 */
const saveAll = async () => {
  const name = draft.name.trim()
  if (name.length < 2 || name.length > 50) {
    ElMessage.warning("名称需 2-50 个字符")
    return
  }
  saving.value = true
  try {
    const res = await updateDigitalApi({
      digitalId: digitalId.value,
      name,
      description: draft.description.trim(),
      avatar: draft.avatar.trim(),
      workId: draft.workId.trim() || undefined,
      visibility: draft.visibility
    })
    if (res.code !== 0) throw new Error(res.msg || "保存失败")

    if (showViewers.value) {
      const viewerRes = await setDigitalViewersApi({
        digitalId: digitalId.value,
        userIds: viewers.value
      })
      if (viewerRes.code !== 0) throw new Error(viewerRes.msg || "保存可见人失败")
    }
    const adminRes = await setDigitalAdminsApi({
      digitalId: digitalId.value,
      userIds: admins.value
    })
    if (adminRes.code !== 0) throw new Error(adminRes.msg || "保存管理员失败")

    ElMessage.success("已保存")
    await ws.refresh()
    admins.value = [...(digital.value?.adminIds ?? [])]
    viewers.value = [...(digital.value?.viewerIds ?? [])]
  } catch (err) {
    ElMessage.error(errorMessage(err, "保存失败"))
  } finally {
    saving.value = false
  }
}

const removeDigital = async () => {
  try {
    await ElMessageBox.confirm(
      `删除后「${digital.value?.name || draft.name}」立即从 IM 中消失，历史会话保留但不可再对话。此操作不可撤销，确认删除？`,
      "删除数字伙伴",
      { type: "warning", confirmButtonText: "确认删除", cancelButtonText: "取消" }
    )
  } catch {
    return
  }
  deleting.value = true
  try {
    const res = await deleteDigitalApi({ digitalId: digitalId.value })
    if (res.code !== 0) throw new Error(res.msg || "删除失败")
    ElMessage.success("已删除")
    router.push("/console/digitals")
  } catch (err) {
    ElMessage.error(errorMessage(err, "删除失败"))
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div v-if="isNew" class="ds-notice ds-notice--brand">
    <span>智能体还没有创建。回到列表用「创建智能体」保存后，这里才能配置工号、管理员与可见范围。</span>
  </div>

  <FormCard v-else title="基本信息">
    <el-form label-width="88px" class="ds-form" @submit.prevent>
      <!-- 第一行：图标 + 名称 -->
      <el-form-item label="图标 / 名称" required>
        <div class="avatar-name">
          <span class="avatar-name__preview">
            <img v-if="draft.avatar" :src="draft.avatar" alt="">
            <template v-else>{{ (draft.name || "?").slice(0, 1) }}</template>
          </span>
          <el-input v-model="draft.name" maxlength="50" show-word-limit placeholder="例如：售后助手" class="avatar-name__name" />
          <el-input v-model="draft.avatar" placeholder="图标地址，可选" class="avatar-name__url" />
        </div>
      </el-form-item>

      <!-- 第二行：描述 -->
      <el-form-item label="描述">
        <el-input
          v-model="draft.description"
          type="textarea"
          :rows="3"
          maxlength="512"
          show-word-limit
          placeholder="一句话说明这个智能体负责什么，会显示在列表卡片上"
        />
      </el-form-item>

      <!-- 第三行：工号 -->
      <el-form-item label="工号">
        <div class="workid">
          <el-input v-model="draft.workId" maxlength="32" placeholder="未分配，可申请一个独立工号" class="workid__input" />
          <el-button :loading="applying" :disabled="!!digital?.workId" @click="applyWorkId">
            {{ digital?.workId ? "已分配" : "申请独立工号" }}
          </el-button>
        </div>
        <p class="ds-hint" style="margin-top: var(--ds-space-2)">
          工号是数字伙伴在组织内的成员编号，全局唯一；申请后固定，也可自行填写未被占用的编号。
        </p>
      </el-form-item>

      <!-- 第四行：管理员 -->
      <el-form-item label="管理员">
        <IdTagsEditor v-model="admins" placeholder="输入管理员用户 ID 后回车添加" hint="管理员可以修改编排、知识源、工具与成员设置。" />
      </el-form-item>

      <!-- 可见范围 -->
      <el-form-item label="可见范围">
        <div class="vis-list">
          <label
            v-for="item in VISIBILITY_CHOICES"
            :key="item.value"
            class="vis-item"
            :class="{ 'vis-item--active': draft.visibility === item.value }"
          >
            <input v-model="draft.visibility" type="radio" :value="item.value" class="vis-item__radio">
            <span class="vis-item__text">
              <span class="vis-item__label">{{ item.label }}</span>
              <span class="vis-item__desc">{{ item.desc }}</span>
            </span>
          </label>
        </div>
      </el-form-item>

      <el-form-item v-if="showViewers" label="可见人">
        <IdTagsEditor v-model="viewers" placeholder="输入可见用户 ID 后回车添加" hint="保存时整表替换：留空表示清空列表。" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="danger" plain :loading="deleting" @click="removeDigital">删除数字伙伴</el-button>
      <span class="foot-spacer" />
      <el-button type="primary" :loading="saving" @click="saveAll">保存</el-button>
    </template>
  </FormCard>
</template>

<style lang="less" scoped>
.avatar-name {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  width: 100%;

  &__preview {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--ds-radius-md);
    border: 1px solid var(--ds-border);
    background: var(--ds-neutral-50);
    font-weight: var(--ds-weight-bold);
    color: var(--ds-neutral-600);
    overflow: hidden;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__name { flex: 0 0 220px; }
  &__url { flex: 1 1 auto; min-width: 180px; }
}

.workid {
  display: flex;
  gap: var(--ds-space-3);
  width: 100%;

  &__input { flex: 0 0 260px; }
}

.vis-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-3);
  width: 100%;
}

.vis-item {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-space-2);
  flex: 1 1 180px;
  min-width: 170px;
  padding: var(--ds-space-3) var(--ds-space-4);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;

  &:hover { border-color: var(--ds-brand-200); }

  &--active {
    border-color: var(--ds-brand);
    background: var(--ds-brand-50);
  }

  &__radio { margin-top: 3px; accent-color: var(--ds-brand); }

  &__text { display: flex; flex-direction: column; gap: 2px; }

  &__label {
    font-size: var(--ds-fs-14);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-neutral-900);
  }

  &__desc {
    font-size: var(--ds-fs-12);
    line-height: var(--ds-lh-body);
    color: var(--ds-neutral-600);
  }
}

.foot-spacer { flex: 1 1 auto; }

@media (max-width: 767px) {
  .avatar-name { flex-wrap: wrap; }
  .avatar-name__name,
  .avatar-name__url,
  .workid__input { flex: 1 1 100%; }
}
</style>
