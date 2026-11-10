<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  beaver-open-header-v1

  工具分区：结构对齐 cloud-console 的 SkillsTab / SkillsMcpPanel。
  工具箱走「工具广场」：浏览平台已启用的工具，点添加即启用；
  MCP 面板：列出平台 MCP 服务，可直接新建、启用于本智能体、删除。
  数字伙伴只存工具/服务的 ID，名称与描述实时取自平台目录，不在 open 层复制一份。
-->

<template>
  <div>
    <div v-if="mode !== 'prompt'" class="ds-notice ds-notice--brand">
      <span>
        当前是{{ mode === 'longconnect' ? '长链接接入' : '工作流编排' }}。工具与 MCP 由平台运行时挂载，只在提示词编排下生效；
        切回「提示词编排」即可在这里配置。
      </span>
    </div>

    <div v-else-if="!digitalId" class="ds-notice ds-notice--brand">
      <span>请先保存智能体，再配置工具。</span>
    </div>

    <div v-else v-loading="loading" class="agent-tools">
      <nav class="agent-tools__nav" role="tablist">
        <button
          type="button"
          role="tab"
          class="agent-tools__nav-btn"
          :class="{ 'agent-tools__nav-btn--active': viewMode === 'toolbox' }"
          @click="viewMode = 'toolbox'"
        >
          工具箱<span class="agent-tools__nav-count">{{ toolIds.length }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="agent-tools__nav-btn"
          :class="{ 'agent-tools__nav-btn--active': viewMode === 'mcp' }"
          @click="viewMode = 'mcp'"
        >
          MCP<span class="agent-tools__nav-count">{{ mcpIds.length }}</span>
        </button>
      </nav>

      <!-- 工具箱 -->
      <section v-if="viewMode === 'toolbox'" class="agent-tools__panel">
        <div class="tool-grid">
          <button type="button" class="tool-card tool-card--entry" @click="plazaVisible = true; plazaSearch = ''">
            <div class="tool-card__body tool-card__body--entry">
              <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
              <span class="tool-card__entry-label">工具广场</span>
              <span class="tool-card__entry-hint">浏览并添加工具</span>
            </div>
          </button>

          <button
            v-for="item in boundTools"
            :key="item.toolId"
            type="button"
            class="tool-card"
            @click="openToolDetail(item.toolId)"
          >
            <div class="tool-card__body">
              <div class="tool-card__row">
                <span class="tool-card__icon" :style="{ background: iconTint(item.name) }">
                  {{ iconLetter(item.name) }}
                </span>
                <div class="tool-card__text">
                  <span class="tool-card__title">{{ item.name }}</span>
                  <span class="tool-card__subtitle">{{ item.toolId }}</span>
                </div>
              </div>
              <p class="tool-card__desc">{{ toolCardDesc(item) }}</p>
            </div>
          </button>

          <p v-if="!boundTools.length" class="tool-grid__empty">
            还没有启用工具，点上方「工具广场」挑几个。
          </p>
        </div>
      </section>

      <!-- MCP -->
      <section v-else class="agent-tools__panel">
        <div class="tool-grid">
          <button type="button" class="tool-card tool-card--entry" @click="openMcpForm">
            <div class="tool-card__body tool-card__body--entry">
              <el-icon class="tool-card__plus-icon"><Plus /></el-icon>
              <span class="tool-card__entry-label">添加 MCP 服务</span>
              <span class="tool-card__entry-hint">填连接配置，建完再启用</span>
            </div>
          </button>

          <button
            v-for="item in mcpServers"
            :key="item.mcpServerId"
            type="button"
            class="tool-card"
            @click="openMcpDetail(item.mcpServerId)"
          >
            <div class="tool-card__body">
              <div class="tool-card__row">
                <span class="tool-card__icon tool-card__icon--mcp">
                  <el-icon><Connection /></el-icon>
                </span>
                <div class="tool-card__text">
                  <span class="tool-card__title">{{ item.name }}</span>
                  <span class="tool-card__subtitle">{{ item.transport || "stdio" }} · {{ sourceText(item.source) }}</span>
                </div>
                <span
                  class="tool-card__status-dot"
                  :class="isMcpEnabled(item.mcpServerId) ? 'is-on' : 'is-off'"
                />
              </div>
            </div>
          </button>

          <p v-if="!mcpServers.length" class="tool-grid__empty">
            平台还没有 MCP 服务，点上方「添加 MCP 服务」新建一个。
          </p>
        </div>
      </section>
    </div>

    <!-- 工具广场 -->
    <el-dialog v-model="plazaVisible" width="760px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">工具广场</h2>
        </div>
      </template>
      <div class="tool-plaza-toolbar">
        <el-input
          v-model="plazaSearch"
          placeholder="搜索名称、编码…"
          clearable
          size="large"
          :prefix-icon="Search"
        />
      </div>
      <div class="tool-plaza-grid">
        <article v-for="item in plazaFiltered" :key="item.toolId" class="tool-plaza-card">
          <div class="tool-plaza-card__head">
            <span class="tool-plaza-card__icon" :style="{ background: iconTint(item.name) }">
              {{ iconLetter(item.name) }}
            </span>
            <div class="tool-card__text">
              <h4 class="tool-plaza-card__name">{{ item.name }}</h4>
              <p class="tool-plaza-card__code">{{ item.toolId }}</p>
            </div>
          </div>
          <p class="tool-plaza-card__desc">{{ toolCardDesc(item) }}</p>
          <div class="tool-plaza-card__actions">
            <el-button
              round
              size="small"
              :type="isToolEnabled(item.toolId) ? 'info' : 'primary'"
              :disabled="isToolEnabled(item.toolId)"
              @click="addTool(item)"
            >
              {{ isToolEnabled(item.toolId) ? "已在工具箱" : "添加" }}
            </el-button>
          </div>
        </article>
        <p v-if="!plazaFiltered.length" class="tool-plaza-grid__empty">
          {{ plazaSearch.trim() ? "无匹配工具" : "暂无工具" }}
        </p>
      </div>
    </el-dialog>

    <!-- 工具详情 -->
    <el-dialog v-model="toolDetailVisible" width="480px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">工具详情</h2>
        </div>
      </template>
      <template v-if="detailTool">
        <div class="tool-detail-hero">
          <span class="tool-detail-hero__icon" :style="{ background: iconTint(detailTool.name) }">
            {{ iconLetter(detailTool.name) }}
          </span>
          <div class="tool-card__text">
            <h3 class="tool-detail-hero__name">{{ detailTool.name }}</h3>
            <p class="tool-detail-hero__code">{{ detailTool.toolId }}</p>
          </div>
        </div>
        <div class="tool-info-grid">
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">类型</span>
            <p class="tool-info-grid__value">{{ toolTypeText(detailTool.toolType) }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">来源</span>
            <p class="tool-info-grid__value">{{ sourceText(detailTool.source) }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">本智能体</span>
            <p class="tool-info-grid__value">已启用</p>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button round @click="toolDetailVisible = false">关闭</el-button>
        <el-button round type="danger" plain @click="removeTool">移除</el-button>
      </template>
    </el-dialog>

    <!-- MCP 详情 -->
    <el-dialog v-model="mcpDetailVisible" width="520px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">MCP 详情</h2>
        </div>
      </template>
      <template v-if="detailMcp">
        <div class="tool-detail-hero">
          <span class="tool-detail-hero__icon tool-card__icon--mcp">
            <el-icon><Connection /></el-icon>
          </span>
          <div class="tool-card__text">
            <h3 class="tool-detail-hero__name">{{ detailMcp.name }}</h3>
            <p class="tool-detail-hero__code">{{ detailMcp.serverName || detailMcp.mcpServerId }}</p>
          </div>
        </div>
        <div class="tool-info-grid">
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">传输方式</span>
            <p class="tool-info-grid__value">{{ detailMcp.transport || "stdio" }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">来源</span>
            <p class="tool-info-grid__value">{{ sourceText(detailMcp.source) }}</p>
          </div>
          <div class="tool-info-grid__row">
            <span class="tool-info-grid__label">连接配置</span>
            <p class="tool-info-grid__value tool-info-grid__mono">{{ detailMcp.config || "未配置" }}</p>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button round @click="mcpDetailVisible = false">关闭</el-button>
        <el-button
          round
          type="primary"
          plain
          @click="detailMcp && toggleMcp(detailMcp.mcpServerId, !isMcpEnabled(detailMcp.mcpServerId))"
        >
          {{ detailMcp && isMcpEnabled(detailMcp.mcpServerId) ? "取消启用" : "启用于本智能体" }}
        </el-button>
        <el-button round type="danger" plain @click="removeMcp">删除</el-button>
      </template>
    </el-dialog>

    <!-- 新建 MCP -->
    <el-dialog v-model="mcpFormVisible" width="560px" destroy-on-close append-to-body class="tool-dialog">
      <template #header>
        <div class="tool-dialog-header">
          <h2 class="tool-dialog-header__title">添加 MCP 服务</h2>
          <p class="tool-dialog-header__sub">平台级服务，建完在列表里启用于本智能体</p>
        </div>
      </template>
      <el-form label-position="top">
        <el-form-item label="服务名称" required>
          <el-input v-model="mcpForm.name" maxlength="64" placeholder="例如：内部工单查询" />
        </el-form-item>
        <el-form-item label="服务标识">
          <el-input v-model="mcpForm.serverName" maxlength="64" placeholder="可选，MCP server name" />
        </el-form-item>
        <el-form-item label="传输方式">
          <el-select v-model="mcpForm.transport" class="mcp-form__select">
            <el-option label="websocket" value="websocket" />
            <el-option label="sse" value="sse" />
            <el-option label="stdio" value="stdio" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接配置（JSON）">
          <el-input
            v-model="mcpForm.config"
            type="textarea"
            :rows="6"
            placeholder='{"url": "wss://example.com/mcp", "headers": {}}'
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mcpFormVisible = false">取消</el-button>
        <el-button type="primary" :loading="mcpSaving" @click="submitMcp">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, reactive, ref, defineComponent } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Connection, Plus, Search } from "@element-plus/icons-vue"
import {
  deleteDigitalMcpApi, listDigitalCatalogApi, saveDigitalMcpApi
} from "@/api/digital"
import type { IDigitalMcpServer, IDigitalTool } from "@/types/api/digital"
import { useDigitalWorkspace } from "../workspace"
import { iconLetter, iconTint } from "@/pages/digitals/components/cardVisual"

export default defineComponent({
  name: "ToolsTab",
  setup() {
    function errorMessage(err: unknown, fallback: string): string {
      if (err instanceof Error && err.message) return err.message
      if (err && typeof err === "object" && "msg" in err) {
        return String((err as { msg?: string }).msg || fallback)
      }
      return fallback
    }

    const ws = useDigitalWorkspace()
    const { mode, digitalId, config } = ws

    const viewMode = ref<"toolbox" | "mcp">("toolbox")

    const tools = ref<IDigitalTool[]>([])
    const mcpServers = ref<IDigitalMcpServer[]>([])
    const loading = ref(false)

    const toolIds = computed(() => config.prompt.tools)
    const mcpIds = computed(() => config.prompt.mcpServerIds)

    /** 已启用的工具，按绑定顺序列出；目录里查不到的 ID 也不隐藏（说明它被平台删了，得让用户看见） */
    const boundTools = computed(() =>
      toolIds.value.map(id => tools.value.find(item => item.toolId === id) || ({
        toolId: id,
        name: id,
        toolType: "",
        source: "",
        status: 0
      } as IDigitalTool))
    )

    const boundMcp = computed(() => mcpIds.value)

    const loadCatalog = async () => {
      loading.value = true
      try {
        const res = await listDigitalCatalogApi()
        if (res.code !== 0) throw new Error(res.msg || "加载工具目录失败")
        tools.value = res.result?.tools ?? []
        mcpServers.value = res.result?.mcpServers ?? []
      } catch (err) {
        ElMessage.error(errorMessage(err, "加载工具目录失败"))
      } finally {
        loading.value = false
      }
    }

    /** 工具/MCP 的启用关系存在编排配置里，改完立即整份落库，不依赖顶部保存按钮 */
    const persist = async (): Promise<boolean> => {
      const ok = await ws.saveConfig()
      return ok
    }

    /* ============ 工具箱 ============ */
    const plazaVisible = ref(false)
    const plazaSearch = ref("")

    const plazaFiltered = computed(() => {
      const keyword = plazaSearch.value.trim().toLowerCase()
      if (!keyword) return tools.value
      return tools.value.filter(item =>
        item.name.toLowerCase().includes(keyword)
        || item.toolId.toLowerCase().includes(keyword)
        || (item.toolType || "").toLowerCase().includes(keyword)
      )
    })

    const isToolEnabled = (toolId: string) => toolIds.value.includes(toolId)

    const addTool = async (item: IDigitalTool) => {
      if (isToolEnabled(item.toolId)) return
      config.prompt.tools = [...toolIds.value, item.toolId]
      if (await persist()) ElMessage.success("已添加到工具箱")
    }

    const detailToolId = ref("")
    const toolDetailVisible = ref(false)
    const detailTool = computed(() => tools.value.find(item => item.toolId === detailToolId.value) || null)

    const openToolDetail = (id: string) => {
      detailToolId.value = id
      toolDetailVisible.value = true
    }

    const removeTool = async () => {
      config.prompt.tools = toolIds.value.filter(id => id !== detailToolId.value)
      if (await persist()) {
        toolDetailVisible.value = false
        ElMessage.success("已移除")
      }
    }

    /* ============ MCP ============ */
    const isMcpEnabled = (mcpServerId: string) => mcpIds.value.includes(mcpServerId)

    const toggleMcp = async (mcpServerId: string, enabled: boolean) => {
      config.prompt.mcpServerIds = enabled
        ? [...mcpIds.value, mcpServerId]
        : mcpIds.value.filter(id => id !== mcpServerId)
      if (await persist()) ElMessage.success(enabled ? "已启用" : "已取消启用")
    }

    const mcpDetailId = ref("")
    const mcpDetailVisible = ref(false)
    const detailMcp = computed(() => mcpServers.value.find(item => item.mcpServerId === mcpDetailId.value) || null)

    const openMcpDetail = (id: string) => {
      mcpDetailId.value = id
      mcpDetailVisible.value = true
    }

    const removeMcp = async () => {
      if (!detailMcp.value) return
      try {
        await ElMessageBox.confirm(
          `删除 MCP 服务「${detailMcp.value.name}」？已启用它的数字伙伴会同时失效。`,
          "删除 MCP 服务",
          { type: "warning" }
        )
      } catch {
        return
      }
      try {
        const res = await deleteDigitalMcpApi({ digitalId: digitalId.value, mcpServerId: detailMcp.value.mcpServerId })
        if (res.code !== 0) throw new Error(res.msg || "删除失败")
        config.prompt.mcpServerIds = mcpIds.value.filter(id => id !== mcpDetailId.value)
        mcpDetailVisible.value = false
        await loadCatalog()
        ElMessage.success("已删除")
      } catch (err) {
        ElMessage.error(errorMessage(err, "删除失败"))
      }
    }

    /* ============ 新建 MCP ============ */
    const mcpFormVisible = ref(false)
    const mcpSaving = ref(false)
    const mcpForm = reactive({
      name: "",
      serverName: "",
      transport: "websocket",
      config: ""
    })

    const openMcpForm = () => {
      mcpForm.name = ""
      mcpForm.serverName = ""
      mcpForm.transport = "websocket"
      mcpForm.config = ""
      mcpFormVisible.value = true
    }

    const submitMcp = async () => {
      const name = mcpForm.name.trim()
      if (!name) {
        ElMessage.warning("请填写服务名称")
        return
      }
      if (mcpForm.config.trim()) {
        try {
          JSON.parse(mcpForm.config)
        } catch {
          ElMessage.warning("连接配置需要是合法 JSON")
          return
        }
      }
      mcpSaving.value = true
      try {
        const res = await saveDigitalMcpApi({
          digitalId: digitalId.value,
          name,
          serverName: mcpForm.serverName.trim() || undefined,
          transport: mcpForm.transport,
          config: mcpForm.config.trim() || undefined
        })
        if (res.code !== 0) throw new Error(res.msg || "创建失败")
        mcpFormVisible.value = false
        await loadCatalog()
        ElMessage.success("已创建，可在列表里启用于本智能体")
      } catch (err) {
        ElMessage.error(errorMessage(err, "创建失败"))
      } finally {
        mcpSaving.value = false
      }
    }

    const toolTypeText = (type?: string) => {
      if (type === "builtin") return "内置工具"
      if (type === "api") return "API 工具"
      if (type === "mcp") return "MCP 工具"
      return type || "工具"
    }

    const sourceText = (source?: string) => (source === "custom" ? "自定义" : "官方")

    /** 平台工具目录目前没有 description 字段，卡片描述位用真实的类型/来源信息，不编造文案。 */
    const toolCardDesc = (item: IDigitalTool) =>
      `${toolTypeText(item.toolType)} · ${sourceText(item.source)}`

    onMounted(loadCatalog)
    return {
      errorMessage, ws, mode, digitalId, config, viewMode, tools, mcpServers, loading,
      toolIds, mcpIds, boundTools, boundMcp, loadCatalog, persist, plazaVisible, plazaSearch,
      plazaFiltered, isToolEnabled, addTool, detailToolId, toolDetailVisible, detailTool,
      openToolDetail, removeTool, isMcpEnabled, toggleMcp, mcpDetailId, mcpDetailVisible,
      detailMcp, openMcpDetail, removeMcp, mcpFormVisible, mcpSaving, mcpForm, openMcpForm,
      submitMcp, toolTypeText, sourceText, toolCardDesc, computed, onMounted, reactive, ref,
      ElMessage, ElMessageBox, Connection, Plus, Search, deleteDigitalMcpApi,
      listDigitalCatalogApi, saveDigitalMcpApi, useDigitalWorkspace, iconLetter, iconTint
    }
  }
})
</script>

<style scoped lang="less">
@import "../../components/toolCards.less";

.agent-tools__nav-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 999px;
  font-size: 11px;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}

.agent-tools__nav-btn--active .agent-tools__nav-count {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.tool-grid__empty {
  grid-column: 1 / -1;
  padding: 28px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.tool-plaza-toolbar {
  margin-bottom: 14px;
}

.tool-plaza-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  max-height: 56vh;
  overflow-y: auto;
  padding: 2px;

  &__empty {
    grid-column: 1 / -1;
    padding: 32px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

.tool-plaza-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: var(--el-bg-color);

  &__head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 700;
  }

  &__name {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__code {
    margin: 3px 0 0;
    font-size: 12px;
    font-family: ui-monospace, monospace;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__desc {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }

  &__actions {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
  }
}

.mcp-form__select {
  width: 100%;
}
</style>
