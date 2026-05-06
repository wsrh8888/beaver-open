<template>
  <div class="bot-panel">
    <el-card shadow="never">
      <!-- Bot 能力开关（对标飞书） -->
      <div class="capability-header">
        <div class="header-left">
          <span class="title">机器人能力</span>
          <el-tag v-if="isBotEnabled" type="success" size="small">已启用</el-tag>
          <el-tag v-else type="info" size="small">未启用</el-tag>
        </div>
        <el-switch
          v-model="isBotEnabled"
          @change="handleToggleBot"
          :loading="toggling"
          active-text="启用"
          inactive-text="禁用"
        />
      </div>

      <el-alert
        v-if="!isBotEnabled"
        title="机器人能力未启用"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          请点击上方开关启用机器人能力，启用后才能配置 Bot 相关信息。
        </template>
      </el-alert>

      <el-alert
        v-else
        title="Bot 配置说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <div style="line-height: 1.8">
            <p><strong>Bot ID：</strong>{{ appId }}</p>
            <p style="margin-top: 8px; font-size: 13px; color: #606266">
              Bot 通过 AppID 标识，无需独立的 Bot ID。
            </p>
            <el-divider style="margin: 12px 0" />
            <p style="font-size: 13px; color: #606266">
              <strong>下一步：</strong>请在「事件订阅」Tab 中配置回调 URL 并订阅“接收消息”事件，这样您的 Bot 才能接收用户消息并做出响应。
            </p>
          </div>
        </template>
      </el-alert>

      <el-tabs v-model="activeTab" class="bot-tabs">
        <!-- 基础配置 -->
        <el-tab-pane label="基础配置" name="basic">
          <el-form label-width="120px" class="config-form">
            <el-form-item label="Bot 名称">
              <el-input 
                v-model="localConfig.botName" 
                placeholder="请输入 Bot 显示名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="Bot 头像">
              <el-input 
                v-model="localConfig.botAvatar" 
                placeholder="请输入头像 URL 地址"
              />
              <div class="form-tip">建议使用正方形图片，最小尺寸 200x200px</div>
            </el-form-item>

            <el-form-item label="Bot 简介">
              <el-input
                v-model="localConfig.botDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入 Bot 的功能介绍"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="使用说明">
              <el-input
                v-model="localConfig.usageGuide"
                type="textarea"
                :rows="4"
                placeholder="请输入 Bot 的使用说明，将显示在机器人卡片上"
                maxlength="500"
                show-word-limit
              />
              <div class="form-tip">用户在 IM 中找到 Bot 时显示的快速入门指南</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic" :loading="saving">
                保存基础配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 能力配置 -->
        <el-tab-pane label="能力配置" name="capabilities">
          <el-form label-width="120px" class="config-form">
            <el-form-item label="能力开关">
              <div class="capability-switches">
                <el-checkbox v-model="localConfig.enableSingleChat">
                  <div class="switch-label">
                    <strong>允许单聊</strong>
                    <span>用户可以与 Bot 进行私聊对话</span>
                  </div>
                </el-checkbox>
                <el-checkbox v-model="localConfig.enableGroupChat">
                  <div class="switch-label">
                    <strong>允许群聊</strong>
                    <span>Bot 可以加入群组并接收消息</span>
                  </div>
                </el-checkbox>
                <el-checkbox v-model="localConfig.enableAtMention">
                  <div class="switch-label">
                    <strong>允许 @ 提及</strong>
                    <span>用户可以在群聊中 @ Bot</span>
                  </div>
                </el-checkbox>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSaveCapabilities" :loading="saving">
                保存能力配置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 自定义菜单 -->
        <el-tab-pane label="自定义菜单" name="menu">
          <div class="menu-config">
            <el-switch
              v-model="localConfig.enableMenu"
              active-text="启用自定义菜单"
              inactive-text="关闭自定义菜单"
              style="margin-bottom: 20px"
            />
            <div class="form-tip" style="margin-bottom: 20px">
              启用后，用户在与 Bot 私聊时会看到快捷菜单按钮
            </div>

            <div v-if="localConfig.enableMenu" class="menu-items">
              <div class="menu-header">
                <span>菜单项配置</span>
                <el-button type="primary" size="small" @click="addMenuItem">
                  添加菜单项
                </el-button>
              </div>

              <div v-for="(item, index) in localConfig.menuItems" :key="index" class="menu-item-card">
                <div class="menu-item-header">
                  <span class="menu-index">菜单项 {{ index + 1 }}</span>
                  <el-button type="danger" size="small" text @click="removeMenuItem(index)">
                    删除
                  </el-button>
                </div>
                <el-form label-width="100px">
                  <el-form-item label="按钮名称">
                    <el-input 
                      v-model="item.name" 
                      placeholder="如：查看帮助"
                      maxlength="20"
                    />
                  </el-form-item>
                  <el-form-item label="响应动作">
                    <el-select v-model="item.actionType" placeholder="请选择动作类型">
                      <el-option label="跳转链接" value="link" />
                      <el-option label="推送事件" value="event" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-if="item.actionType === 'link'" label="跳转链接">
                    <el-input 
                      v-model="item.linkUrl" 
                      placeholder="https://..."
                    />
                  </el-form-item>
                  <el-form-item v-if="item.actionType === 'event'" label="事件 ID">
                    <el-input 
                      v-model="item.eventId" 
                      placeholder="如：help_command"
                    />
                    <div class="form-tip">点击按钮时将推送此事件到您的 Webhook</div>
                  </el-form-item>
                </el-form>
              </div>

              <el-empty v-if="localConfig.menuItems.length === 0" description="暂无菜单项，请点击上方按钮添加" />
            </div>

            <el-button v-if="localConfig.enableMenu" type="primary" @click="handleSaveMenu" :loading="saving" style="margin-top: 20px">
              保存菜单配置
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBotConfigApi, updateBotConfigApi } from '@/api/bot'
import { toggleAppCapabilityApi } from '@/api/app'

interface IMenuItem {
  name: string
  actionType: 'link' | 'event'
  linkUrl?: string
  eventId?: string
}

interface IBotConfig {
  botName: string
  botAvatar: string
  botDescription: string
  usageGuide: string
  enableSingleChat: boolean
  enableGroupChat: boolean
  enableAtMention: boolean
  enableMenu: boolean
  menuItems: IMenuItem[]
}

export default defineComponent({
  name: 'BotPanel',
  props: {
    appId: {
      type: String,
      required: true
    },
    enableBot: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:enableBot'],
  setup(props, { emit }) {
    const activeTab = ref('basic')
    const isBotEnabled = computed({
      get: () => props.enableBot === 1,
      set: (val) => emit('update:enableBot', val ? 1 : 0)
    })
    const toggling = ref(false)
    const localConfig = reactive<IBotConfig>({
      botName: '',
      botAvatar: '',
      botDescription: '',
      usageGuide: '',
      enableSingleChat: true,
      enableGroupChat: true,
      enableAtMention: true,
      enableMenu: false,
      menuItems: []
    })
    const saving = ref(false)
    const loading = ref(false)

    // 切换 Bot 能力开关
    const handleToggleBot = async (value: string | number | boolean) => {
      const enabled = value === true || value === 1 || value === '1'
      try {
        await ElMessageBox.confirm(
          value ? '启用机器人能力后，用户将可以在 IM 中搜索到此 Bot。确定要启用吗？' : '禁用机器人能力后，用户将无法在 IM 中搜索到此 Bot。确定要禁用吗？',
          value ? '启用机器人能力' : '禁用机器人能力',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        toggling.value = true
        const res = await toggleAppCapabilityApi({
          appId: props.appId,
          capability: 'bot',
          enable: enabled
        })
        if (res.code === 0) {
          ElMessage.success(enabled ? '机器人能力已启用' : '机器人能力已禁用')
          isBotEnabled.value = enabled
          // 如果启用，重新加载 Bot 配置
          if (enabled) {
            await loadBotConfig()
          }
        }
      } catch (error) {
        // 用户取消，恢复原状态
        isBotEnabled.value = !enabled
      } finally {
        toggling.value = false
      }
    }

    // 加载 Bot 配置
    const loadBotConfig = async () => {
      loading.value = true
      const res = await getBotConfigApi({ appId: props.appId })
      if (res.code === 0 && res.result?.config) {
        Object.assign(localConfig, {
          botName: res.result.config.botName || '',
          botAvatar: res.result.config.botAvatar || '',
          botDescription: res.result.config.botDescription || '',
          usageGuide: res.result.config.usageGuide || '',
          enableSingleChat: res.result.config.enableSingleChat ?? true,
          enableGroupChat: res.result.config.enableGroupChat ?? true,
          enableAtMention: res.result.config.enableAtMention ?? true,
          enableMenu: res.result.config.enableMenu ?? false,
          menuItems: res.result.config.menuItems ? JSON.parse(res.result.config.menuItems) : []
        })
      }
      loading.value = false
    }

    // 保存基础配置
    const handleSaveBasic = async () => {
      if (!localConfig.botName) {
        ElMessage.warning('请输入 Bot 名称')
        return
      }
      
      saving.value = true
      const res = await updateBotConfigApi({
        appId: props.appId,
        botName: localConfig.botName,
        botAvatar: localConfig.botAvatar,
        botDescription: localConfig.botDescription,
        usageGuide: localConfig.usageGuide,
        enableSingleChat: localConfig.enableSingleChat,
        enableGroupChat: localConfig.enableGroupChat,
        enableAtMention: localConfig.enableAtMention,
        enableMenu: localConfig.enableMenu,
        menuItems: JSON.stringify(localConfig.menuItems)
      })
      if (res.code === 0) {
        ElMessage.success('基础配置保存成功')
        await loadBotConfig()
      }
      saving.value = false
    }

    // 保存能力配置
    const handleSaveCapabilities = async () => {
      saving.value = true
      const res = await updateBotConfigApi({
        appId: props.appId,
        botName: localConfig.botName,
        botAvatar: localConfig.botAvatar,
        botDescription: localConfig.botDescription,
        usageGuide: localConfig.usageGuide,
        enableSingleChat: localConfig.enableSingleChat,
        enableGroupChat: localConfig.enableGroupChat,
        enableAtMention: localConfig.enableAtMention,
        enableMenu: localConfig.enableMenu,
        menuItems: JSON.stringify(localConfig.menuItems)
      })
      if (res.code === 0) {
        ElMessage.success('能力配置保存成功')
        await loadBotConfig()
      }
      saving.value = false
    }

    // 添加菜单项
    const addMenuItem = () => {
      localConfig.menuItems.push({
        name: '',
        actionType: 'link',
        linkUrl: '',
        eventId: ''
      })
    }

    // 删除菜单项
    const removeMenuItem = (index: number) => {
      localConfig.menuItems.splice(index, 1)
    }

    // 保存菜单配置
    const handleSaveMenu = async () => {
      // 验证菜单项
      for (let i = 0; i < localConfig.menuItems.length; i++) {
        const item = localConfig.menuItems[i]
        if (!item.name) {
          ElMessage.warning(`请填写第 ${i + 1} 个菜单项的名称`)
          return
        }
        if (item.actionType === 'link' && !item.linkUrl) {
          ElMessage.warning(`请填写第 ${i + 1} 个菜单项的跳转链接`)
          return
        }
        if (item.actionType === 'event' && !item.eventId) {
          ElMessage.warning(`请填写第 ${i + 1} 个菜单项的事件 ID`)
          return
        }
      }

      saving.value = true
      const res = await updateBotConfigApi({
        appId: props.appId,
        botName: localConfig.botName,
        botAvatar: localConfig.botAvatar,
        botDescription: localConfig.botDescription,
        usageGuide: localConfig.usageGuide,
        enableSingleChat: localConfig.enableSingleChat,
        enableGroupChat: localConfig.enableGroupChat,
        enableAtMention: localConfig.enableAtMention,
        enableMenu: localConfig.enableMenu,
        menuItems: JSON.stringify(localConfig.menuItems)
      })
      if (res.code === 0) {
        ElMessage.success('菜单配置保存成功')
        await loadBotConfig()
      }
      saving.value = false
    }

    onMounted(() => {
      loadBotConfig()
    })

    return {
      activeTab,
      isBotEnabled,
      toggling,
      localConfig,
      saving,
      loading,
      handleToggleBot,
      handleSaveBasic,
      handleSaveCapabilities,
      addMenuItem,
      removeMenuItem,
      handleSaveMenu
    }
  }
})
</script>

<style scoped lang="less">
.bot-panel {
  max-height: calc(100vh - 280px);
  overflow-y: auto;

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  .bot-tabs {
    :deep(.el-tabs__content) {
      padding-top: var(--spacing-md);
    }
  }

  .capability-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);

      .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
  }

  .config-form {
    .form-tip {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 4px;
      line-height: 1.5;
    }

    .capability-switches {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);

      .switch-label {
        strong {
          display: block;
          font-size: 14px;
          color: var(--text-primary);
          margin-bottom: 2px;
        }

        span {
          font-size: 12px;
          color: var(--text-secondary);
        }
      }
    }
  }

  .menu-config {
    .menu-items {
      .menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-md);
        font-weight: 500;
        color: var(--text-primary);
      }

      .menu-item-card {
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-md);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);

        .menu-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);

          .menu-index {
            font-weight: 500;
            color: var(--text-primary);
          }
        }
      }
    }
  }
}
</style>
