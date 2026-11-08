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
import { computed, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { createOAuthAppApi } from "@/api/oauth"
import PageHeader from "../_shared/PageHeader.vue"
import CredentialPanel from "../_shared/CredentialPanel.vue"
import { errorMessage } from "../_shared/console"

const router = useRouter()
const step = ref(0)
const submitting = ref(false)
const formRef = ref<any>(null)

const form = reactive({ name: "", description: "", icon: "" })
const rules = {
  name: [
    { required: true, message: "请输入应用名称", trigger: "blur" },
    { min: 2, max: 50, message: "2-50 字符", trigger: "blur" }
  ]
}

const created = reactive({ oauthId: "", oauthSecret: "" })
const credentialItems = computed(() => [
  { label: "OAuth ID", value: created.oauthId, hint: "应用的客户端 ID" },
  { label: "OAuthSecret", value: created.oauthSecret, hint: "仅此一次可见，用于服务端换取 token" }
])

const backToList = () => router.push("/console/oauth")

const submit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const res = await createOAuthAppApi({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined
    })
    if (res.code !== 0) throw new Error(res.msg || "创建失败")
    created.oauthId = res.result?.oauthId ?? ""
    created.oauthSecret = res.result?.oauthSecret ?? ""
    step.value = 1
  } catch (err) {
    ElMessage.error(errorMessage(err, "创建失败"))
  } finally {
    submitting.value = false
  }
}

const goDetail = () => {
  if (!created.oauthId) {
    backToList()
    return
  }
  router.push(`/console/oauth/${created.oauthId}?tab=platforms`)
}
</script>

<template>
  <div>
    <PageHeader
      title="创建 OAuth 应用"
      desc="先填写基本信息，创建成功后保存密钥，再到详情页配置权限范围与各端接入。"
      back-to="/console/oauth"
      back-label="返回应用列表"
    />

    <div class="ds-wizard">
      <el-steps :active="step" finish-status="success" align-center class="ds-wizard__steps">
        <el-step title="基础信息" description="名称与展示信息" />
        <el-step title="完成" description="保存应用密钥" />
      </el-steps>

      <template v-if="step === 0">
        <div class="ds-wizard__body">
          <h2 class="ds-wizard__title">基础信息</h2>
          <p class="ds-wizard__lead">这些信息会展示在授权页上，创建后仍可修改。</p>

          <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="ds-form">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="例如：团队协作工具" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="可选，告诉用户这个应用会做什么"
              />
            </el-form-item>
            <el-form-item label="图标 URL">
              <el-input v-model="form.icon" placeholder="可选，填写完整图片地址" />
            </el-form-item>
          </el-form>
        </div>

        <div class="ds-wizard__foot">
          <el-button @click="backToList">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submit">创建并获取密钥</el-button>
        </div>
      </template>

      <template v-else>
        <div class="ds-wizard__body">
          <h2 class="ds-wizard__title">应用已创建，请保存应用密钥</h2>
          <p class="ds-wizard__lead">下一步配置权限范围与 H5 / 桌面端 / 移动端的接入参数。</p>
          <CredentialPanel :items="credentialItems" />
        </div>

        <div class="ds-wizard__foot">
          <el-button @click="backToList">返回列表</el-button>
          <el-button type="primary" @click="goDetail">我已保存，前往端配置</el-button>
        </div>
      </template>
    </div>
  </div>
</template>
