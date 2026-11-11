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
  <div class="ws">
    <!-- 顶部：返回 + 标题 + 副标题，对齐控制台惯例，不再用步骤条 / 概览区 / 大徽标 -->
    <header class="ws-head">
      <button class="ws-back" type="button" @click="goList">
        <el-icon><ArrowLeft /></el-icon>返回列表
      </button>

      <div class="ws-head__row">
        <div class="ws-head__text">
          <el-input
            v-if="isNew"
            v-model="draft.name"
            class="ws-name-input"
            maxlength="50"
            placeholder="给智能体起个名字"
            aria-label="智能体名称"
          />
          <h1 v-else class="ws-title">{{ digital?.name || "智能体" }}</h1>
        </div>
        <div v-if="isNew" class="ws-head__actions">
          <span class="ws-draft-tag">草稿 · 未创建</span>
          <el-button type="primary" :loading="creating" @click="createNow">创建智能体</el-button>
        </div>
      </div>
    </header>

    <TabNav :tabs="tabs" :active="active" :disabled="disabledTabs" @select="select" />

    <div v-if="loadFailed" class="ds-notice ds-notice--danger">
      无法加载该智能体，请返回列表后重试。
    </div>

    <template v-else-if="ready">
      <!-- :key 随实体变化，强制重建分区，避免复用时残留上一个实体的局部表单状态 -->
      <div :key="digitalId || 'new'" v-loading="config.loading.value">
        <OrchestrationTab v-if="active === 'orchestration'" />
        <KnowledgeTab v-else-if="active === 'knowledge'" />
        <ToolsTab v-else-if="active === 'tools'" />
        <SettingsTab v-else-if="active === 'settings'" />
        <DeveloperOptionsTab v-else-if="active === 'developer'" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, watch, defineComponent } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { ArrowLeft } from "@element-plus/icons-vue"
import { createDigitalApi, getDigitalDetailApi, updateDigitalApi } from "@/api/digital"
import type { IDigitalInfo } from "@/types/api/digital"
import TabNav from "@/pages/digitals/components/TabNav.vue"
import { modeText } from "@/pages/digitals/detail/constants"
import { credentialFlash, setCredentialFlash } from "./credentialFlash"
import {
  digitalConfig,
  digitalDraft,
  digitalWorkspaceKey,
  modeToRuntime,
  resetDigitalWorkspaceDraft,
  runtimeToMode,
  type DigitalMode,
  type DigitalWorkspace
} from "./workspace"
import OrchestrationTab from "./tabs/OrchestrationTab.vue"
import KnowledgeTab from "./tabs/KnowledgeTab.vue"
import ToolsTab from "./tabs/ToolsTab.vue"
import DeveloperOptionsTab from "./tabs/DeveloperOptionsTab.vue"
import SettingsTab from "./tabs/SettingsTab.vue"

export default defineComponent({
  name: "DigitalsDetailPage",
  components: { ArrowLeft, TabNav, OrchestrationTab, KnowledgeTab, ToolsTab, DeveloperOptionsTab, SettingsTab },
  setup() {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    /** 分区与 URL ?tab= 双向同步：刷新、分享、浏览器后退都停在同一分区。本页自己用，不抽公共 composable。 */
    function useTabNav(tabs: { key: string; label: string }[], defaultKey?: string) {
      const tabRoute = useRoute()
      const tabRouter = useRouter()
      const fallback = defaultKey || tabs[0]?.key || ""
      const active = computed(() => {
        const queryTab = String(tabRoute.query.tab || "")
        return tabs.some(item => item.key === queryTab) ? queryTab : fallback
      })
      const select = (key: string) => {
        if (key === active.value) return
        tabRouter.replace({ query: { ...tabRoute.query, tab: key } })
      }
      return { active, select }
    }

    /**
     * 创建与修改是同一个工作台：
     * /digitals/create 是草稿态，:digitalId 是实体态，共用本组件、同一组分区与同一份表单。
     * 草稿态下任意分区点保存（或顶部「创建智能体」）都会先把实体落库，再保存当前配置，
     * 之后原地 replace 到真实 ID，用户不会跳到另一个界面。
     */
    const route = useRoute()
    const router = useRouter()

    const isNew = computed(() => route.meta.isNew === true || route.path.endsWith("/create"))
    const digitalId = computed(() => (isNew.value ? "" : String(route.params.digitalId || "")))
    const digital = ref<IDigitalInfo | null>(null)
    const draft = digitalDraft
    const config = digitalConfig
    const creating = ref(false)
    const loadFailed = ref(false)
    /** 从服务端整份拉取配置期间要抑制自动保存，否则刚加载进来的值会被当成用户改动再写回去。 */
    const autosaveArmed = ref(false)
    let autosaveTimer: ReturnType<typeof setTimeout> | undefined

    const tabs = [
      { key: "orchestration", label: "编排" },
      { key: "knowledge", label: "知识源" },
      { key: "tools", label: "工具" },
      { key: "settings", label: "设置" },
      { key: "developer", label: "开发者选项" }
    ]
    const { active, select } = useTabNav(tabs, "orchestration")

    const mode = computed<DigitalMode>(() =>
      isNew.value ? draft.mode : runtimeToMode(String(digital.value?.runtime ?? ""))
    )
    // 只有提示词编排（平台运行时）才用得到平台托管的知识源与工具；长链接接入与工作流均不开放这两个分区。
    const disabledTabs = computed<string[]>(() => (mode.value === "prompt" ? [] : ["knowledge", "tools"]))
    const legacyWorkflow = computed(() => false)
    const ready = computed(() => isNew.value || !!digital.value)
    /**
     * 编排分区没有独立保存按钮，改动直接在停顿后静默落库：
     * 只在实体态生效（草稿态仍由顶部「创建智能体」一次性创建 + 保存），失败才提示。
     */
    const scheduleAutosave = () => {
      if (!autosaveArmed.value || !digitalId.value || config.loading.value) return
      if (autosaveTimer) clearTimeout(autosaveTimer)
      autosaveTimer = setTimeout(() => {
        const id = digitalId.value
        if (!id) return
        void config.save(id, mode.value)
      }, 1000)
    }

    watch([() => config.prompt, () => config.external], scheduleAutosave, { deep: true })

    onBeforeUnmount(() => {
      if (autosaveTimer) clearTimeout(autosaveTimer)
    })

    const goList = () => router.push("/digitals")
    const goTab = (key: string) => {
      if (key === active.value) return
      router.replace({ query: { ...route.query, tab: key } })
    }

    const loadDetail = async (id: string) => {
      if (!id) {
        digital.value = null
        return
      }
      loadFailed.value = false
      try {
        const res = await getDigitalDetailApi({ digitalId: id })
        const info = res?.result?.digital
        if (!info) throw new Error("智能体不存在")
        digital.value = info
        // 基础信息在两种形态下都编辑同一份 draft，避免两处表单各写一遍
        draft.name = info.name
        draft.description = info.description || ""
        draft.avatar = info.avatar || ""
        draft.workId = info.workId || ""
        draft.visibility = info.visibility || "private"
        draft.mode = runtimeToMode(String(info.runtime))
        route.meta.entityName = info.name
      } catch (err) {
        loadFailed.value = true
        ElMessage.error(errorMessage(err, "加载智能体详情失败"))
      }
    }

    const refresh = () => loadDetail(digitalId.value)

    /**
     * 草稿态 → 实体态：先校验、创建、把已编辑的编排配置一并落库，再换 URL。
     * 列表页的「创建智能体」直接建好实体进这里，草稿态只在直接访问 /create 时才会走到。
     */
    const ensureCreated = async (): Promise<string> => {
      if (digitalId.value) return digitalId.value
      if (creating.value) return ""
      const name = draft.name.trim()
      if (name.length < 2 || name.length > 50) {
        ElMessage.warning("请先在顶部填写智能体名称（2-50 字符）")
        return ""
      }
      if (!config.validate(mode.value)) return ""

      creating.value = true
      try {
        const runtime = modeToRuntime(mode.value)
        const res = await createDigitalApi({
          name,
          description: draft.description.trim() || undefined,
          avatar: draft.avatar.trim() || undefined,
          workId: draft.workId.trim() || undefined,
          runtime,
          visibility: draft.visibility
        })
        if (res.code !== 0) throw new Error(res.msg || "创建失败")
        const id = res.result?.digitalId ?? ""
        if (!id) throw new Error("创建失败：未返回 digitalId")

        // 草稿里已经填过的编排内容随创建一起保存，不丢编辑
        await config.save(id, mode.value)
        if (runtime === "external") {
          setCredentialFlash(id, {
            appKey: res.result?.appKey ?? "",
            appSecret: res.result?.appSecret ?? "",
            reason: "create"
          })
        }
        await router.replace({ path: `/digitals/${id}`, query: { ...route.query, tab: active.value } })
        ElMessage.success("智能体已创建")
        return id
      } catch (err) {
        ElMessage.error(errorMessage(err, "创建失败"))
        return ""
      } finally {
        creating.value = false
      }
    }

    /** 各分区统一走这里：草稿态先创建（创建时已保存配置），实体态直接整份提交。 */
    const saveConfig = async (): Promise<boolean> => {
      const existed = !!digitalId.value
      const id = await ensureCreated()
      if (!id) return false
      if (!existed) return true
      const ok = await config.save(id, mode.value)
      if (ok) ElMessage.success("已保存")
      return ok
    }

    const createNow = async () => {
      const id = await ensureCreated()
      // 长链接模式创建完立刻把一次性凭据摆到用户面前，避免离开页面后丢失
      if (id && credentialFlash.digitalId === id) goTab("developer")
    }

    /**
     * 切换编排方式：服务端 UpdateDigital 接受 runtime，随时可换。
     * 切换不动已有配置列——三种 runtime 各占一列互不覆盖，切回去内容还在。
     */
    const switchMode = async (next: DigitalMode): Promise<boolean> => {
      if (next === mode.value) return true
      if (isNew.value) {
        draft.mode = next
        return true
      }
      const id = digitalId.value
      if (!id) return false
      try {
        const res = await updateDigitalApi({ digitalId: id, runtime: modeToRuntime(next) })
        if (res.code !== 0) throw new Error(res.msg || "切换失败")
        await loadDetail(id)
        // 服务端没落库（旧版本不认 runtime）时不要假装成功，否则界面切了、数据没切
        if (mode.value !== next) throw new Error("服务端未接受编排方式变更，请确认后端已更新到最新版本")
        // 切到长链接且此前没有凭据时，服务端补发一把明文，必须当场展示
        if (res.result?.appSecret) {
          setCredentialFlash(id, {
            appKey: res.result.appKey ?? "",
            appSecret: res.result.appSecret,
            reason: "create"
          })
          goTab("developer")
        }
        ElMessage.success(`已切换为${modeText(next)}`)
        return true
      } catch (err) {
        ElMessage.error(errorMessage(err, "切换编排方式失败"))
        return false
      }
    }

    const syncFromRoute = async () => {
      route.meta.entityName = undefined
      autosaveArmed.value = false
      if (isNew.value) {
        // 弹窗创建时已把名称/描述写进 draft 并跳到 /create，这里不要再清空，否则白填。
        if (!digitalDraft.name && !digitalDraft.description) {
          resetDigitalWorkspaceDraft()
        }
        loadFailed.value = false
        return
      }
      const id = digitalId.value
      if (!id) {
        loadFailed.value = true
        return
      }
      await loadDetail(id)
      // 刚创建完的实体，本地配置已经与服务端一致，不要重新拉取把草稿内容冲掉
      if (config.loadedId.value !== id) await config.load(id)
      // 等配置赋值触发的 watch 全部跑完再解除抑制，避免加载回来的值又被写回去
      await nextTick()
      autosaveArmed.value = true
    }

    onMounted(syncFromRoute)

    watch(digitalId, (id, previous) => {
      if (id !== previous) void syncFromRoute()
    })

    // 从详情页再点「创建智能体」时组件可能被复用，onMounted 不会重跑
    watch(isNew, value => {
      if (value) void syncFromRoute()
    })

    // 编排方式切到非提示词时，知识源/工具会被禁用；若正停在这两个分区，自动退回编排。
    watch(mode, () => {
      if (disabledTabs.value.includes(active.value)) goTab("orchestration")
    })

    provide(digitalWorkspaceKey, {
      isNew,
      digitalId,
      digital,
      draft,
      mode,
      legacyWorkflow,
      config,
      ensureCreated,
      saveConfig,
      switchMode,
      refresh,
      goTab
    } satisfies DigitalWorkspace)
    return {
      errorMessage, useTabNav, route, router, isNew, digitalId, digital,
      draft, config, creating, loadFailed, tabs, active, select, mode, disabledTabs,
      legacyWorkflow, ready, goList, goTab, loadDetail, refresh,
      ensureCreated, saveConfig, createNow, switchMode, syncFromRoute, computed, onMounted,
      onBeforeUnmount, nextTick, provide, ref, watch, useRoute, useRouter, ElMessage, ArrowLeft,
      createDigitalApi, getDigitalDetailApi, updateDigitalApi, TabNav, modeText, credentialFlash,
      setCredentialFlash, digitalConfig, digitalDraft, digitalWorkspaceKey, modeToRuntime,
      resetDigitalWorkspaceDraft, runtimeToMode, OrchestrationTab, KnowledgeTab, ToolsTab,
      DeveloperOptionsTab, SettingsTab, autosaveArmed, scheduleAutosave
    }
  }
})
</script>

<style lang="less" scoped>
.ws-head { margin-bottom: var(--ds-space-4); }

.ws-back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ds-neutral-600);
  font-family: inherit;
  font-size: var(--ds-fs-13);
  cursor: pointer;

  &:hover { color: var(--ds-brand); }
}

.ws-head__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--ds-space-4);
  margin-top: var(--ds-space-2);
}

.ws-head__text { min-width: 0; flex: 1 1 auto; }

.ws-title {
  font-size: var(--ds-fs-20);
  font-weight: var(--ds-weight-bold);
  line-height: var(--ds-lh-heading);
  color: var(--ds-neutral-900);
  word-break: break-all;
}

.ws-name-input {
  max-width: 420px;

  :deep(.el-input__wrapper) {
    box-shadow: none;
    padding-left: 0;
    background: transparent;
  }

  :deep(.el-input__inner) {
    font-size: var(--ds-fs-20);
    font-weight: var(--ds-weight-bold);
    color: var(--ds-neutral-900);
  }
}

.ws-head__actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: var(--ds-space-3);
}

.ws-draft-tag {
  font-size: var(--ds-fs-12);
  color: var(--ds-neutral-500);
}

@media (max-width: 767px) {
  .ws-head__row { flex-direction: column; align-items: stretch; }
  .ws-head__actions { justify-content: flex-start; }
}
</style>
