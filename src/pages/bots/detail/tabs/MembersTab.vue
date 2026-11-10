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
  <div>
    <FormCard title="可见范围" desc="决定谁能在群里找到并使用这个机器人。">
      <el-form label-width="96px" class="ds-form">
        <el-form-item label="可见性">
          <el-select v-model="visibility" style="width: 100%">
            <el-option
              v-for="option in VISIBILITY_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <p class="ds-hint" style="margin-top: var(--ds-space-2)">
            选择「指定成员」时，下方的可见人列表才会生效。
          </p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving === 'visibility'" @click="saveVisibility">保存可见性</el-button>
      </template>
    </FormCard>

    <FormCard title="管理员" desc="可以修改机器人信息、重置密钥与管理成员。">
      <IdTagsEditor v-model="admins" placeholder="输入管理员用户 ID" />
      <template #footer>
        <el-button type="primary" :loading="saving === 'admins'" @click="saveAdmins">保存管理员</el-button>
      </template>
    </FormCard>

    <FormCard title="可见人" desc="可见性为「指定成员」时，只有列表中的用户能使用这个机器人。">
      <IdTagsEditor v-model="viewers" placeholder="输入可见用户 ID" />
      <div class="ds-notice" style="margin-top: var(--ds-space-4)">
        <span>保存时整表替换：留空表示清空列表，不是「保持不变」。请确认后再提交。</span>
      </div>
      <template #footer>
        <el-button type="primary" :loading="saving === 'viewers'" @click="saveViewers">保存可见人</el-button>
      </template>
    </FormCard>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { ref, defineComponent, toRefs } from "vue"
import { ElMessage } from "element-plus"
import { setBotAdminsApi, setBotViewersApi, updateBotApi } from "@/api/bot"
import type { BotVisibility, IBotInfo } from "@/types/api/bot"
import FormCard from "@/pages/bots/components/FormCard.vue"
import IdTagsEditor from "@/pages/bots/components/IdTagsEditor.vue"

export default defineComponent({
  name: "MembersTab",
  components: { FormCard, IdTagsEditor },
  props: {
    bot: { type: Object as PropType<IBotInfo>, required: true }
  },
  emits: ["refresh"],
  setup(props, { emit }) {
    const VISIBILITY_OPTIONS = [
      { value: "private", label: "私有", desc: "仅管理员可见，适合内部调试" },
      { value: "partial", label: "指定成员", desc: "仅「成员与可见性」中的可见人可用" },
      { value: "public", label: "公开", desc: "全站可搜索、可被拉入会话" }
    ] as const

    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const saving = ref<"" | "visibility" | "admins" | "viewers">("")
    const visibility = ref<BotVisibility>(props.bot.visibility || "private")
    const admins = ref<string[]>([...(props.bot.adminIds ?? [])])
    const viewers = ref<string[]>([...(props.bot.viewerIds ?? [])])

    const runSave = async (
      kind: "visibility" | "admins" | "viewers",
      action: () => Promise<{ code: number; msg?: string }>,
      successText: string
    ) => {
      saving.value = kind
      try {
        const res = await action()
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        ElMessage.success(successText)
        emit("refresh")
      } catch (err) {
        ElMessage.error(errorMessage(err, "保存失败"))
      } finally {
        saving.value = ""
      }
    }

    const saveVisibility = () =>
      runSave("visibility", () => updateBotApi({
        botId: props.bot.botId,
        visibility: visibility.value
      }), "可见性已保存")

    const saveAdmins = () =>
      runSave("admins", () => setBotAdminsApi({
        botId: props.bot.botId,
        userIds: admins.value
      }), "管理员已保存")

    const saveViewers = () =>
      runSave("viewers", () => setBotViewersApi({
        botId: props.bot.botId,
        userIds: viewers.value
      }), "可见人已保存")
    return {
      ...toRefs(props), props, emit, VISIBILITY_OPTIONS, errorMessage, saving, visibility,
      admins, viewers, runSave, saveVisibility, saveAdmins, saveViewers, ref, ElMessage,
      setBotAdminsApi, setBotViewersApi, updateBotApi, FormCard, IdTagsEditor
    }
  }
})
</script>
