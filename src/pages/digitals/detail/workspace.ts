/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-open
 * https://github.com/wsrh8888/beaver-open
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-open-header-v1
 */

import { inject, reactive, ref, type ComputedRef, type InjectionKey, type Ref } from "vue"
import { ElMessage } from "element-plus"
import type { DigitalRuntime, DigitalVisibility, IDigitalInfo } from "@/types/api/digital"
import {
  getDigitalConfigApi, saveDigitalConfigApi
} from "@/api/digital"

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

function parseConfig<T>(raw: unknown, fallback: T): T {
  let value: unknown = raw
  if (typeof raw === "string") {
    if (!raw.trim()) return fallback
    try {
      value = JSON.parse(raw)
    } catch {
      return fallback
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback
  return { ...fallback, ...(value as Record<string, unknown>) } as T
}

function shortId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 编排只有三种形态，与后端 runtime oneof 一一对应：
 * - prompt      提示词编排：走平台自有运行时，配置人设、模型、工具与知识；
 * - longconnect 长链接接入：第三方服务通过长连接（WebSocket）接入，平台只签凭据并转发消息；
 * - workflow    工作流编排：由工作流驱动，节点编排在「编排」分区配置。
 */
export type DigitalMode = "prompt" | "longconnect" | "workflow"

export function modeToRuntime(mode: DigitalMode): DigitalRuntime {
  if (mode === "workflow") return "workflow"
  if (mode === "longconnect") return "external"
  return "builtin"
}

export function runtimeToMode(runtime?: string): DigitalMode {
  if (runtime === "workflow") return "workflow"
  if (runtime === "external") return "longconnect"
  return "prompt"
}

export interface DigitalDraft {
  name: string
  description: string
  avatar: string
  workId: string
  visibility: DigitalVisibility
  mode: DigitalMode
}

/** 表单变量的一行。key 只用于 v-for，不写进服务端 JSON。 */
export interface VariableRow {
  key: string
  name: string
  label: string
  type: "text" | "number" | "select"
  default: string
  required: boolean
  options: string[]
}

/** 提示词编排的完整配置，对应服务端 BuiltinConfig。 */
export interface PromptConfig {
  systemPrompt: string
  llmModelId: string
  temperature: number | null
  maxTurns: number | null
  openingMessage: string
  openingQuestions: string[]
  variables: VariableRow[]
  tools: string[]
  mcpServerIds: string[]
  /**
   * 运行时实际检索的扁平知识库 ID。
   * 这列由后端按 open_knowledge_source 表合并去重派生，config/save 会重算回填，
   * 这里只做回显，不要在前端编辑，也不要随编排配置提交。
   */
  knowledgeIds: string[]
}

/** 长链接接入（external runtime）的完整配置，对应服务端 ExternalConfig。 */
export interface ExternalConfigState {
  callbackUrl: string
}

export interface DigitalConfigService {
  prompt: PromptConfig
  external: ExternalConfigState
  loading: Ref<boolean>
  saving: Ref<boolean>
  /** 最近一次与服务端同步过的实体 ID；草稿创建后不等于空，避免重复拉取把编辑内容冲掉。 */
  loadedId: Ref<string>
  load: (id: string) => Promise<void>
  /** 创建前先校验，避免实体已落库但配置写不进去。 */
  validate: (mode: DigitalMode) => boolean
  /** 整份提交：服务端按 runtime 只认一列，分区各自保存时必须带全量，否则会互相覆盖。 */
  save: (id: string, mode: DigitalMode) => Promise<boolean>
}

export interface DigitalWorkspace {
  isNew: ComputedRef<boolean>
  digitalId: ComputedRef<string>
  digital: Ref<IDigitalInfo | null>
  draft: DigitalDraft
  mode: ComputedRef<DigitalMode>
  config: DigitalConfigService
  /** 草稿态下先创建实体，再返回可用的 digitalId；已存在时直接返回。 */
  ensureCreated: () => Promise<string>
  /** 保存编排配置（草稿态会先创建）。 */
  saveConfig: () => Promise<boolean>
  /** 切换编排方式：实体态落库 runtime，草稿态只改本地草稿。 */
  switchMode: (next: DigitalMode) => Promise<boolean>
  /** 重新读取实体基础信息。 */
  refresh: () => Promise<void>
  goTab: (key: string) => void
}

export const digitalWorkspaceKey: InjectionKey<DigitalWorkspace> = Symbol("digital-workspace")

export function useDigitalWorkspace(): DigitalWorkspace {
  const workspace = inject(digitalWorkspaceKey)
  if (!workspace) throw new Error("DigitalWorkspace 未提供")
  return workspace
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(item => typeof item === "string").map(String)
    : []
}

function emptyPrompt(): PromptConfig {
  return {
    systemPrompt: "",
    llmModelId: "",
    temperature: null,
    maxTurns: null,
    openingMessage: "",
    openingQuestions: [],
    variables: [],
    tools: [],
    mcpServerIds: [],
    knowledgeIds: []
  }
}

export function newDraft(): DigitalDraft {
  return {
    name: "",
    description: "",
    avatar: "",
    workId: "",
    visibility: "private",
    mode: "prompt"
  }
}

/**
 * 编排配置是模块级单例：草稿态「先编辑、后创建」以及 router.replace 换路由记录时，
 * 组件可能被重建，本地编辑不能因此丢失。切到另一个实体时会由 load() 整体覆盖。
 */
export function createDigitalConfig(): DigitalConfigService {
  const prompt = reactive<PromptConfig>(emptyPrompt())
  const external = reactive<ExternalConfigState>({ callbackUrl: "" })
  const workflow = reactive<Record<string, unknown>>({})
  const loading = ref(false)
  const saving = ref(false)
  const loadedId = ref("")

  const load = async (id: string) => {
    loadedId.value = id
    Object.assign(prompt, emptyPrompt())
    external.callbackUrl = ""
    if (!id) return
    loading.value = true
    try {
      const res = await getDigitalConfigApi({ digitalId: id })
      const result = res?.result
      const raw = parseConfig<Record<string, unknown>>(result?.builtinConfig, {})
      const modelParams = raw.modelParams &&
        typeof raw.modelParams === "object" &&
        !Array.isArray(raw.modelParams)
        ? (raw.modelParams as Record<string, unknown>)
        : {}

      prompt.systemPrompt = String(raw.systemPrompt ?? "")
      prompt.llmModelId = String(raw.llmModelId ?? "")
      prompt.temperature = typeof modelParams.temperature === "number" ? modelParams.temperature : null
      prompt.maxTurns = typeof modelParams.maxTurns === "number" ? modelParams.maxTurns : null
      prompt.openingMessage = String(raw.openingMessage ?? "")
      prompt.openingQuestions = asStringArray(raw.openingQuestions)
      prompt.tools = asStringArray(raw.tools)
      prompt.mcpServerIds = asStringArray(raw.mcpServerIds)
      // 只读回显：知识源已迁到后端实体，运行时列表由后端按知识源表重算。
      prompt.knowledgeIds = asStringArray(raw.knowledgeIds)

      const variables = Array.isArray(raw.variables) ? raw.variables : []
      prompt.variables = variables.map((item: any) => ({
        key: shortId("var"),
        name: String(item?.name ?? ""),
        label: String(item?.label ?? ""),
        type: (["text", "number", "select"].includes(item?.type) ? item.type : "text") as VariableRow["type"],
        default: String(item?.default ?? ""),
        required: Boolean(item?.required),
        options: asStringArray(item?.options)
      }))

      const ext = parseConfig<{ callbackUrl?: string }>(result?.externalConfig, {})
      external.callbackUrl = String(ext.callbackUrl ?? "")

      const wf = parseConfig<Record<string, unknown>>(result?.workflowConfig, {})
      Object.assign(workflow, wf)
    } catch {
      // 首次创建后还没有配置行时接口可能返回空字段，按空配置继续编辑即可
    } finally {
      loading.value = false
    }
  }

  const validateVariables = (): boolean => {
    const names = prompt.variables.map(item => item.name.trim()).filter(Boolean)
    if (names.length !== prompt.variables.length) {
      ElMessage.warning("请填写变量名，或删除空白行")
      return false
    }
    if (new Set(names).size !== names.length) {
      ElMessage.warning("变量名不能重复")
      return false
    }
    return true
  }

  const validate = (mode: DigitalMode): boolean => {
    if (mode === "prompt") return validateVariables()
    if (mode === "workflow") return true
    const value = external.callbackUrl.trim()
    if (value && !/^https?:\/\//i.test(value)) {
      ElMessage.warning("回调地址请填写 http(s) 开头的完整 URL")
      return false
    }
    return true
  }

  const save = async (id: string, mode: DigitalMode): Promise<boolean> => {
    if (!id || !validate(mode)) return false
    saving.value = true
    try {
      if (mode === "prompt") {
        if (!validateVariables()) return false
        // 不提交 knowledgeIds / knowledgeSources：知识源是后端实体，
        // 服务端在 config/save 时按 open_knowledge_source 表重算运行时列表并回填，
        // 前端若跟着提交会把其它分区刚改过的引用覆盖掉。
        const modelParams: Record<string, number> = {}
        if (typeof prompt.temperature === "number") modelParams.temperature = prompt.temperature
        if (typeof prompt.maxTurns === "number") modelParams.maxTurns = prompt.maxTurns
        const payload = {
          systemPrompt: prompt.systemPrompt.trim(),
          llmModelId: prompt.llmModelId.trim(),
          modelParams,
          openingMessage: prompt.openingMessage.trim(),
          openingQuestions: prompt.openingQuestions.map(item => item.trim()).filter(Boolean),
          variables: prompt.variables.map(item => ({
            name: item.name.trim(),
            label: item.label.trim(),
            type: item.type,
            default: item.default.trim() || undefined,
            required: item.required,
            options: item.type === "select" ? item.options : undefined
          })),
          tools: prompt.tools,
          mcpServerIds: prompt.mcpServerIds
        }
        const res = await saveDigitalConfigApi({
          digitalId: id,
          builtinConfig: JSON.stringify(payload)
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
      } else if (mode === "workflow") {
        const res = await saveDigitalConfigApi({
          digitalId: id,
          workflowConfig: JSON.stringify(workflow)
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
      } else {
        const value = external.callbackUrl.trim()
        if (value && !/^https?:\/\//i.test(value)) {
          throw new Error("回调地址请填写 http(s) 开头的完整 URL")
        }
        const res = await saveDigitalConfigApi({
          digitalId: id,
          externalConfig: JSON.stringify(value ? { callbackUrl: value } : {})
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
      }
      loadedId.value = id
      return true
    } catch (err) {
      ElMessage.error(errorMessage(err, "保存失败"))
      return false
    } finally {
      saving.value = false
    }
  }

  return { prompt, external, loading, saving, loadedId, load, validate, save }
}

/**
 * 草稿与编排配置放在模块作用域：创建成功后会 router.replace 到详情路由，
 * 组件可能被重建，草稿态已经填过的内容必须原样保留。
 */
export const digitalDraft = reactive<DigitalDraft>(newDraft())
export const digitalConfig = createDigitalConfig()

export function resetDigitalWorkspaceDraft(): void {
  Object.assign(digitalDraft, newDraft())
  void digitalConfig.load("")
}
