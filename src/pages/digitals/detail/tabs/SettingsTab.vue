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

<template>
  <div v-if="isNew" class="ds-notice ds-notice--brand">
    <span>智能体还没有创建。回到列表用「创建智能体」保存后，这里才能配置工号、管理员与可见范围。</span>
  </div>

  <FormCard v-else title="基本信息">
    <el-form label-width="88px" class="ds-form" @submit.prevent>
      <el-form-item label="图标 / 名称" required>
        <div class="identity">
          <span class="identity__avatar">
            <img v-if="draft.avatar" :src="draft.avatar" alt="">
            <template v-else>{{ (draft.name || "?").slice(0, 1) }}</template>
          </span>
          <el-input
            v-model="draft.name"
            maxlength="50"
            show-word-limit
            placeholder="例如：售后助手"
            class="identity__name"
          />
        </div>
      </el-form-item>

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

      <el-form-item label="工号">
        <div class="workid">
          <span class="workid__value" :class="{ 'is-empty': !draft.workId }">
            {{ draft.workId || "未申请" }}
          </span>
          <el-button :loading="applying" :disabled="!!digital?.workId" @click="applyWorkId">
            {{ digital?.workId ? "已分配" : "申请独立工号" }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="管理员">
        <IdTagsEditor
          v-model="admins"
          placeholder="输入管理员用户 ID 后回车添加"
          hint="管理员可以修改编排、知识源、工具与成员设置。"
        />
      </el-form-item>

      <el-form-item label="可见范围">
        <div class="vis-grid">
          <button
            v-for="item in VISIBILITY_CHOICES"
            :key="item.value"
            type="button"
            class="vis-card"
            :class="{ 'vis-card--active': draft.visibility === item.value }"
            @click="draft.visibility = item.value"
          >
            <span class="vis-card__icon"><el-icon><component :is="item.icon" /></el-icon></span>
            <span class="vis-card__label">{{ item.label }}</span>
            <span class="vis-card__desc">{{ item.desc }}</span>
            <el-icon v-if="draft.visibility === item.value" class="vis-card__check">
              <CircleCheckFilled />
            </el-icon>
          </button>
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

<script lang="ts">
import { computed, ref, defineComponent } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { CircleCheckFilled, Lock, User, View } from "@element-plus/icons-vue"
import {
  deleteDigitalApi, setDigitalAdminsApi, setDigitalViewersApi, updateDigitalApi
} from "@/api/digital"
import { useDigitalWorkspace } from "../workspace"
import FormCard from "@/pages/digitals/components/FormCard.vue"
import IdTagsEditor from "@/pages/digitals/components/IdTagsEditor.vue"

export default defineComponent({
  name: "SettingsTab",
  components: { CircleCheckFilled, FormCard, IdTagsEditor },
  setup() {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

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
      { value: "private", label: "非公开", desc: "仅管理员可搜索和使用", icon: Lock },
      { value: "partial", label: "部分人", desc: "只有指定的可见人可以使用", icon: User },
      { value: "public", label: "公开", desc: "全站可搜索、可被拉入会话", icon: View }
    ] as const

    const showViewers = computed(() => draft.visibility === "partial")

    /** 申请平台分配工号：服务端生成编号，全局唯一；工号不接受手填。 */
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
     * 工号只由「申请独立工号」写入，这里不回传，避免只读值被当表单覆盖。
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
        router.push("/digitals")
      } catch (err) {
        ElMessage.error(errorMessage(err, "删除失败"))
      } finally {
        deleting.value = false
      }
    }
    return {
      errorMessage, ws, isNew, draft, digital, digitalId, router, saving, applying, deleting,
      admins, viewers, VISIBILITY_CHOICES, showViewers, applyWorkId, saveAll, removeDigital,
      computed, ref, useRouter, ElMessage, ElMessageBox, CircleCheckFilled, Lock, User, View,
      deleteDigitalApi, setDigitalAdminsApi, setDigitalViewersApi, updateDigitalApi,
      useDigitalWorkspace, FormCard, IdTagsEditor
    }
  }
})
</script>

<style lang="less" scoped>
.identity {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  width: 100%;

  &__avatar {
    flex: 0 0 auto;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    border: 1px solid var(--ds-border);
    background: var(--ds-neutral-50);
    font-size: 20px;
    font-weight: var(--ds-weight-bold);
    color: var(--ds-neutral-600);
    overflow: hidden;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  &__name { flex: 1 1 auto; max-width: 320px; }
}

.workid {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  width: 100%;

  &__value {
    min-width: 180px;
    padding: 0 12px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    border-radius: var(--ds-radius-md);
    border: 1px solid var(--ds-border);
    background: var(--ds-neutral-50);
    font-family: ui-monospace, "Cascadia Code", monospace;
    font-size: var(--ds-fs-14);
    color: var(--ds-neutral-900);

    &.is-empty { color: var(--ds-neutral-600); font-family: inherit; }
  }
}

.vis-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
}

.vis-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  min-height: 118px;
  padding: 14px;
  text-align: left;
  border: 1px solid var(--ds-border);
  border-radius: 12px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;

  &:hover { border-color: var(--ds-brand-200); }

  &--active {
    border-color: var(--ds-brand);
    background: var(--ds-brand-50);
    box-shadow: 0 0 0 1px var(--ds-brand) inset;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    font-size: 16px;
    color: var(--ds-neutral-600);
    background: var(--ds-neutral-50);

    .vis-card--active & {
      color: var(--ds-brand);
      background: var(--el-bg-color);
    }
  }

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

  &__check {
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 16px;
    color: var(--ds-brand);
  }
}

.foot-spacer { flex: 1 1 auto; }

@media (max-width: 767px) {
  .identity { flex-wrap: wrap; }
  .identity__name { max-width: none; flex: 1 1 100%; }
  .vis-grid { grid-template-columns: 1fr; }
}
</style>
