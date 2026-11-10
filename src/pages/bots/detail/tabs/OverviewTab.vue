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

<script lang="ts">
import type { PropType } from "vue"
import { reactive, ref, defineComponent, toRefs } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { deleteBotApi, updateBotApi } from "@/api/bot"
import type { BotVisibility, IBotInfo } from "@/types/api/bot"
import FormCard from "@/pages/bots/components/FormCard.vue"

export default defineComponent({
  name: "OverviewTab",
  components: { FormCard },
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

    async function copyText(text: string, label = "已复制"): Promise<void> {
      if (!text) {
        ElMessage.warning("内容为空")
        return
      }
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
        } else {
          const el = document.createElement("textarea")
          el.value = text
          el.style.position = "fixed"
          el.style.opacity = "0"
          document.body.appendChild(el)
          el.select()
          const ok = document.execCommand("copy")
          document.body.removeChild(el)
          if (!ok) throw new Error("execCommand copy failed")
        }
        ElMessage.success(label)
      } catch {
        ElMessage.error("复制失败，请手动选中复制")
      }
    }

    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    function formatTime(value?: number): string {
      if (!value) return "—"
      const ms = value < 1e12 ? value * 1000 : value
      return new Date(ms).toLocaleString("zh-CN", { hour12: false })
    }

    function visibilityText(value?: string): string {
      if (value === "public") return "公开"
      if (value === "partial") return "指定成员"
      return "私有"
    }

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
            router.push("/bots")
          } catch (err) {
            ElMessage.error(errorMessage(err, "删除失败"))
          } finally {
            deleting.value = false
          }
        })
        .catch(() => undefined)
    }
    return {
      ...toRefs(props), props, emit, VISIBILITY_OPTIONS, copyText, errorMessage, formatTime,
      visibilityText, route, router, saving, deleting, formRef, form, rules, goTab, save,
      handleDelete, reactive, ref, useRoute, useRouter, ElMessage, ElMessageBox, deleteBotApi,
      updateBotApi, FormCard
    }
  }
})
</script>
