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
import { reactive, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteBotApi, updateBotApi } from "@/api/bot"
import type { BotVisibility, IBotInfo } from "@/types/api/bot"
import FormCard from "../../../_shared/FormCard.vue"
import {
  VISIBILITY_OPTIONS,
  copyText,
  errorMessage,
  formatTime,
  visibilityText
} from "../../../_shared/console"

const props = defineProps<{ bot: IBotInfo }>()
const emit = defineEmits<{
  (e: "refresh"): void
}>()

const route = useRoute()
const router = useRouter()
const saving = ref(false)
const deleting = ref(false)
const formRef = ref<any>(null)

const form = reactive({
  name: props.bot.name,
  avatar: props.bot.avatar || "",
  visibility: (props.bot.visibility || "private") as BotVisibility
})

const rules = {
  name: [
    { required: true, message: "请输入机器人名称", trigger: "blur" },
    { min: 2, max: 50, message: "2-50 字符", trigger: "blur" }
  ]
}

const goTab = (tab: string) => router.replace({ query: { ...route.query, tab } })

const save = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const res = await updateBotApi({
      botId: props.bot.botId,
      name: form.name.trim(),
      avatar: form.avatar.trim(),
      visibility: form.visibility
    })
    if (res.code !== 0) throw new Error(res.msg || "保存失败")
    ElMessage.success("已保存")
    emit("refresh")
  } catch (err) {
    ElMessage.error(errorMessage(err, "保存失败"))
  } finally {
    saving.value = false
  }
}

const handleDelete = () => {
  ElMessageBox.confirm(
    `删除「${props.bot.name}」后 Webhook 与 Token 立即失效，且不可恢复。确认删除？`,
    "删除推送机器人",
    { type: "warning", confirmButtonText: "确认删除", cancelButtonText: "取消" }
  )
    .then(async () => {
      deleting.value = true
      try {
        const res = await deleteBotApi({ botId: props.bot.botId })
        if (res.code !== 0) throw new Error(res.msg || "删除失败")
        ElMessage.success("已删除")
        router.push("/console/bots")
      } catch (err) {
        ElMessage.error(errorMessage(err, "删除失败"))
      } finally {
        deleting.value = false
      }
    })
    .catch(() => undefined)
}
</script>

<template>
  <div>
    <FormCard title="身份信息" desc="由平台生成，只读。">
      <div class="ds-summary">
        <span class="ds-summary__key">Bot ID</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ bot.botId }}</code>
          <el-button link type="primary" @click="copyText(bot.botId, 'Bot ID 已复制')">复制</el-button>
        </span>
        <span class="ds-summary__key">可见性</span>
        <span class="ds-summary__val">{{ visibilityText(bot.visibility) }}</span>
        <span class="ds-summary__key">创建时间</span>
        <span class="ds-summary__val">{{ formatTime(bot.createdAt) }}</span>
      </div>
    </FormCard>

    <FormCard title="基础信息" desc="名称与头像会展示在群成员列表里。">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="ds-form">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="头像 URL">
          <el-input v-model="form.avatar" placeholder="可选，填写完整图片地址" />
        </el-form-item>
        <el-form-item label="可见性">
          <el-select v-model="form.visibility" style="width: 100%">
            <el-option
              v-for="option in VISIBILITY_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving" @click="save">保存修改</el-button>
      </template>
    </FormCard>

    <FormCard title="快捷入口" desc="接入信息与成员分别独立配置。">
      <div class="ds-inline-actions">
        <el-button type="primary" @click="goTab('webhook')">查看接入信息</el-button>
        <el-button @click="goTab('members')">设置成员</el-button>
      </div>
    </FormCard>

    <FormCard title="删除机器人" desc="删除后不可恢复，正在使用 Webhook 的服务会立即停止推送。" danger>
      <div class="ds-inline-actions">
        <el-button type="danger" plain :loading="deleting" @click="handleDelete">删除这个机器人</el-button>
      </div>
    </FormCard>
  </div>
</template>
