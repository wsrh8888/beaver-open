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
import { deleteOAuthAppApi, updateOAuthAppApi } from "@/api/oauth"
import type { IOAuthAppInfo } from "@/types/api/oauth"
import FormCard from "../../../_shared/FormCard.vue"
import { copyText, errorMessage, formatTime } from "../../../_shared/console"

const props = defineProps<{ app: IOAuthAppInfo }>()
const emit = defineEmits<{
  (e: "refresh"): void
}>()

const route = useRoute()
const router = useRouter()
const saving = ref(false)
const deleting = ref(false)
const formRef = ref<any>(null)

const form = reactive({
  name: props.app.name,
  description: props.app.description || "",
  icon: props.app.icon || ""
})
const rules = {
  name: [
    { required: true, message: "请输入应用名称", trigger: "blur" },
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
    const res = await updateOAuthAppApi({
      oauthId: props.app.oauthId,
      name: form.name.trim(),
      description: form.description.trim(),
      icon: form.icon.trim()
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
    `删除「${props.app.name}」后所有端都无法再发起授权，且不可恢复。确认删除？`,
    "删除 OAuth 应用",
    { type: "warning", confirmButtonText: "确认删除", cancelButtonText: "取消" }
  )
    .then(async () => {
      deleting.value = true
      try {
        const res = await deleteOAuthAppApi({ oauthId: props.app.oauthId })
        if (res.code !== 0) throw new Error(res.msg || "删除失败")
        ElMessage.success("已删除")
        router.push("/console/oauth")
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
        <span class="ds-summary__key">OAuth ID</span>
        <span class="ds-summary__val">
          <code class="ds-mono">{{ app.oauthId }}</code>
          <el-button link type="primary" @click="copyText(app.oauthId, 'OAuth ID 已复制')">复制</el-button>
        </span>
        <span class="ds-summary__key">状态</span>
        <span class="ds-summary__val">{{ app.status === 1 ? "启用" : "禁用" }}</span>
        <span class="ds-summary__key">创建时间</span>
        <span class="ds-summary__val">{{ formatTime(app.createdAt) }}</span>
      </div>
    </FormCard>

    <FormCard title="基础信息" desc="授权页上展示给用户的名称、说明与图标。">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="ds-form">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
        <el-form-item label="图标 URL">
          <el-input v-model="form.icon" placeholder="可选，填写完整图片地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving" @click="save">保存修改</el-button>
      </template>
    </FormCard>

    <FormCard title="快捷入口" desc="凭证、权限范围与各端接入分别独立配置。">
      <div class="ds-inline-actions">
        <el-button type="primary" @click="goTab('platforms')">配置接入端</el-button>
        <el-button @click="goTab('scopes')">设置权限范围</el-button>
        <el-button @click="goTab('credentials')">查看凭证</el-button>
      </div>
    </FormCard>

    <FormCard title="删除应用" desc="删除后不可恢复，所有已接入端会立即失效。" danger>
      <div class="ds-inline-actions">
        <el-button type="danger" plain :loading="deleting" @click="handleDelete">删除这个应用</el-button>
      </div>
    </FormCard>
  </div>
</template>
