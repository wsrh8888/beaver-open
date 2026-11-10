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
    <PageHeader
      title="创建推送机器人"
      desc="先给机器人起个名字，创建成功后会拿到 Webhook 与调用凭据。"
      back-to="/bots"
      back-label="返回机器人列表"
    />

    <div class="ds-wizard">
      <el-steps :active="step" finish-status="success" align-center class="ds-wizard__steps">
        <el-step title="基础信息" description="名称与可见范围" />
        <el-step title="完成" description="保存接入凭据" />
      </el-steps>

      <template v-if="step === 0">
        <div class="ds-wizard__body">
          <h2 class="ds-wizard__title">基础信息</h2>
          <p class="ds-wizard__lead">创建只需要一个名称。头像、成员等其它内容都可以在创建后的详情页里补。</p>

          <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="ds-form">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="例如：发布通知" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                maxlength="512"
                show-word-limit
                placeholder="可选，说明这个机器人用来推送什么"
              />
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
              <p class="ds-hint" style="margin-top: var(--ds-space-2)">{{ visibilityDesc }}</p>
            </el-form-item>
          </el-form>

          <div style="margin-top: var(--ds-space-5)">
            <el-button link type="primary" @click="showAdvanced = !showAdvanced">
              {{ showAdvanced ? "收起高级选项" : "展开高级选项" }}
            </el-button>
            <div v-if="showAdvanced" style="margin-top: var(--ds-space-4)">
              <el-form label-width="96px" class="ds-form">
                <el-form-item label="初始群 ID">
                  <el-input v-model="form.groupId" placeholder="可选，创建后立即拉入该群" />
                  <p class="ds-hint" style="margin-top: var(--ds-space-2)">
                    只用于创建时拉群，不会记在机器人上。之后想加别的群，在群设置里操作即可。
                  </p>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>

        <div class="ds-wizard__foot">
          <el-button @click="backToList">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="submit">创建并获取凭据</el-button>
        </div>
      </template>

      <template v-else>
        <div class="ds-wizard__body">
          <h2 class="ds-wizard__title">机器人已创建，请保存接入凭据</h2>
          <p class="ds-wizard__lead">
            把 Webhook URL 配到你的服务里即可推送消息。Token 与签名密钥只在这里明文显示一次。
          </p>
          <CredentialPanel :items="credentialItems" />
        </div>

        <div class="ds-wizard__foot">
          <el-button @click="backToList">返回列表</el-button>
          <el-button type="primary" @click="goWebhook">我已保存，前往接入信息</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, reactive, ref, defineComponent } from "vue"
import { useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { createBotApi } from "@/api/bot"
import type { BotVisibility } from "@/types/api/bot"
import PageHeader from "@/pages/bots/components/PageHeader.vue"
import CredentialPanel from "@/pages/bots/components/CredentialPanel.vue"

export default defineComponent({
  name: "BotsCreatePage",
  setup() {
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

    const router = useRouter()
    const step = ref(0)
    const submitting = ref(false)
    const showAdvanced = ref(false)
    const formRef = ref<any>(null)

    const form = reactive({
      name: "",
      description: "",
      visibility: "private" as BotVisibility,
      groupId: ""
    })

    const rules = {
      name: [
        { required: true, message: "请输入机器人名称", trigger: "blur" },
        { min: 2, max: 50, message: "2-50 字符", trigger: "blur" }
      ]
    }

    const created = reactive({
      botId: "",
      webhookUrl: "",
      token: "",
      secret: ""
    })

    const credentialItems = computed(() => [
      { label: "Bot ID", value: created.botId, hint: "机器人唯一标识" },
      { label: "Webhook URL", value: created.webhookUrl, hint: "推送消息的入口地址" },
      { label: "Token", value: created.token, hint: "调用凭据，仅此一次可见" },
      { label: "签名密钥", value: created.secret, hint: "HMAC 加签用，仅此一次可见" }
    ])

    const visibilityDesc = computed(() =>
      VISIBILITY_OPTIONS.find(item => item.value === form.visibility)?.desc || ""
    )

    const backToList = () => router.push("/bots")

    const submit = async () => {
      if (!formRef.value) return
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return
      submitting.value = true
      try {
        const res = await createBotApi({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          visibility: form.visibility,
          groupId: form.groupId.trim() || undefined
        })
        if (res.code !== 0) throw new Error(res.msg || "创建失败")
        created.botId = res.result?.botId ?? ""
        created.webhookUrl = res.result?.webhookUrl ?? ""
        created.token = res.result?.token ?? ""
        created.secret = res.result?.secret ?? ""
        step.value = 1
      } catch (err) {
        ElMessage.error(errorMessage(err, "创建失败"))
      } finally {
        submitting.value = false
      }
    }

    const goWebhook = () => {
      if (!created.botId) {
        backToList()
        return
      }
      router.push(`/bots/${created.botId}?tab=webhook`)
    }
    return {
      VISIBILITY_OPTIONS, errorMessage, router, step, submitting, showAdvanced, formRef, form,
      rules, created, credentialItems, visibilityDesc, backToList, submit, goWebhook,
      computed, reactive, ref, useRouter, ElMessage, createBotApi, PageHeader,
      CredentialPanel
    }
  }
})
</script>
