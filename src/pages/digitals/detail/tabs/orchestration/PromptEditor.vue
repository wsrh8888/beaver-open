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
    <FormCard title="提示词" :desc="promptDesc">
      <div class="prompt-toolbar">
        <el-dropdown v-if="variableOptions.length" trigger="click" @command="insertVariable">
          <el-button size="small">插入变量</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="item in variableOptions"
                :key="item.name"
                :command="item.name"
              >
                {{ item.label || item.name }}（{{ varToken(item.name) }}）
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-input
        v-model="prompt.systemPrompt"
        type="textarea"
        :rows="12"
        maxlength="8000"
        show-word-limit
        placeholder="例如：你是售后助手，先确认订单号，再给出可执行的解决方案。"
      />
    </FormCard>

    <FormCard title="变量" desc="用户开始对话前填写的字段，值会替换提示词里的同名占位符。">
      <div class="ds-editor">
        <div class="ds-editor__head">
          <span>共 {{ prompt.variables.length }} 个变量</span>
          <el-button link type="primary" @click="addVariable">
            <el-icon><Plus /></el-icon>添加变量
          </el-button>
        </div>

        <div v-if="!prompt.variables.length" class="ds-editor__empty">
          还没有变量。纯对话型智能体可以不配置。
        </div>

        <div v-for="(row, index) in prompt.variables" :key="row.key" class="ds-variable-row">
          <div style="width: 140px">
            <span class="ds-mini-label">变量名</span>
            <el-input v-model="row.name" placeholder="order_id" />
          </div>
          <div style="width: 140px">
            <span class="ds-mini-label">展示标签</span>
            <el-input v-model="row.label" placeholder="订单号" />
          </div>
          <div style="width: 110px">
            <span class="ds-mini-label">类型</span>
            <el-select v-model="row.type">
              <el-option label="文本" value="text" />
              <el-option label="数字" value="number" />
              <el-option label="下拉" value="select" />
            </el-select>
          </div>
          <div style="width: 130px">
            <span class="ds-mini-label">默认值</span>
            <el-input v-model="row.default" placeholder="可选" />
          </div>
          <div style="min-width: 80px">
            <span class="ds-mini-label">必填</span>
            <el-checkbox v-model="row.required" label="是" />
          </div>
          <div v-if="row.type === 'select'" style="min-width: 220px; flex: 1">
            <span class="ds-mini-label">下拉选项</span>
            <IdTagsEditor v-model="row.options" placeholder="输入选项后按回车" hint="" />
          </div>
          <el-button link type="danger" style="margin-top: 18px" @click="removeVariable(index)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </div>
      </div>
    </FormCard>

    <FormCard title="对话开场" desc="用户进入会话时看到的第一句话与可点击的引导问题。">
      <el-form label-width="110px" class="ds-form--wide">
        <el-form-item label="开场白">
          <el-input
            v-model="prompt.openingMessage"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
            placeholder="可选，留空则不主动开口"
          />
        </el-form-item>
        <el-form-item label="开场问题">
          <IdTagsEditor
            v-model="prompt.openingQuestions"
            placeholder="输入一个引导问题后按回车"
            hint="用户进入会话时可一键发送这些问题；留空表示不展示。"
          />
        </el-form-item>
      </el-form>
    </FormCard>

    <FormCard title="模型与高级" desc="不指定模型 ID 时由平台使用默认模型；留空的参数沿用模型默认值。">
      <el-form label-width="110px" class="ds-form--wide">
        <el-form-item label="模型 ID">
          <el-input v-model="prompt.llmModelId" placeholder="引用 agent_models.model_id" />
        </el-form-item>
        <el-form-item label="生成风格">
          <el-radio-group v-model="generationStyle">
            <el-radio-button value="stable">更稳定</el-radio-button>
            <el-radio-button value="balanced">默认</el-radio-button>
            <el-radio-button value="creative">更发散</el-radio-button>
            <el-radio-button value="custom">自定义</el-radio-button>
          </el-radio-group>
          <p class="ds-hint" style="margin-top: var(--ds-space-2)">
            通过 temperature 控制：更稳定 0.2 / 默认 0.7 / 更发散 1.1。
          </p>
        </el-form-item>
        <el-form-item v-if="generationStyle === 'custom'" label="temperature">
          <el-input-number
            v-model="prompt.temperature"
            :min="0"
            :max="2"
            :step="0.1"
            :precision="1"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="最大轮次">
          <el-input-number
            v-model="prompt.maxTurns"
            :min="1"
            :max="100"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
    </FormCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue"
import { Delete, Plus } from "@element-plus/icons-vue"
import { useDigitalWorkspace, type VariableRow } from "../../workspace"
import FormCard from "@/pages/digitals/components/FormCard.vue"
import IdTagsEditor from "@/pages/digitals/components/IdTagsEditor.vue"

type GenerationStyle = "stable" | "balanced" | "creative" | "custom"

export default defineComponent({
  name: "PromptEditor",
  setup() {
    function shortId(prefix: string): string {
      return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
    }

    const ws = useDigitalWorkspace()
    const prompt = ws.config.prompt
    const promptDesc = "定义智能体是谁、怎么回答。用双花括号包裹变量名即可引用下方表单变量。"

    const stylePresets: Record<Exclude<GenerationStyle, "custom">, number> = {
      stable: 0.2,
      balanced: 0.7,
      creative: 1.1
    }

    const generationStyle = computed<GenerationStyle>({
      get() {
        const value = prompt.temperature
        if (value === null) return "balanced"
        const matched = (Object.keys(stylePresets) as Array<Exclude<GenerationStyle, "custom">>)
          .find(key => Math.abs(stylePresets[key] - value) < 0.001)
        return matched ?? "custom"
      },
      set(value) {
        prompt.temperature = value === "custom"
          ? (prompt.temperature ?? 0.7)
          : stylePresets[value]
      }
    })

    const addVariable = () => {
      prompt.variables.push({
        key: shortId("var"),
        name: "",
        label: "",
        type: "text",
        default: "",
        required: false,
        options: []
      })
    }

    const removeVariable = (index: number) => prompt.variables.splice(index, 1)

    const insertVariable = (name: string) => {
      const token = `{{${name}}}`
      prompt.systemPrompt = prompt.systemPrompt ? `${prompt.systemPrompt}${token}` : token
    }

    /** 在 UI 里展示一个字面量占位符，例如 {{order_id}}；放在方法里避免模板里出现裸 {{ 被编译器误判。 */
    const varToken = (name: string): string => `{{${name}}}`

    const variableOptions = computed(() =>
      prompt.variables.filter((item: VariableRow) => item.name.trim())
    )
    return {
      shortId, ws, prompt, promptDesc, stylePresets, generationStyle, addVariable,
      removeVariable, insertVariable, varToken, variableOptions, computed, Delete, Plus,
      useDigitalWorkspace, FormCard, IdTagsEditor
    }
  }
})
</script>

<style lang="less" scoped>
.prompt-toolbar { margin-bottom: var(--ds-space-3); }
</style>
