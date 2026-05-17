<template>
  <div class="desktop-oauth">
    <!-- 集成指南 -->
    <el-alert
      title="集成指南"
      type="info"
      :closable="false"
      style="margin-bottom: 20px;"
    >
      <template #default>
        <p><strong>在您的 PC 客户端中嵌入以下 iframe：</strong></p>
        <pre>&lt;iframe
  width="100%"
  height="100%"
  frameborder="0"
  src="{{ authPageUrl }}"
&gt;&lt;/iframe&gt;</pre>
        <p style="margin-top: 8px; color: #909399;">
          用户扫码或快速登录后，会通过 Scheme 回调到您的客户端：<code>{{ customScheme || 'yourapp://...' }}?code=xxx</code>
        </p>
      </template>
    </el-alert>

    <el-form label-width="140px">
      <el-form-item label="启用桌面端应用">
        <el-switch v-model="enabled" />
        <div class="form-tip">
          开启后，用户才能通过 PC 客户端进行 OAuth 授权登录
        </div>
      </el-form-item>

      <el-form-item label="自定义 Scheme">
        <el-input 
          v-model="customScheme" 
          placeholder="yourapp://oauth/callback"
        />
        <div class="form-tip">
          PC 客户端的回调协议，如：yourapp://oauth/callback。需要在客户端中注册该 Scheme
        </div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存配置
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOAuthConfigApi, updateOAuthConfigApi } from '@/api/oauth'

export default defineComponent({
  name: 'DesktopOAuth',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const enabled = ref(false)
    const customScheme = ref('')
    const authPageUrl = ref('') // 授权页面 URL（从后端获取）
    const saving = ref(false)

    const loadConfig = async () => {
      const res = await getOAuthConfigApi({ 
        appId: props.appId,
        oauthType: 'desktop'
      })
      if (res.code === 0 && res.result?.desktopConfig) {
        const config = res.result.desktopConfig
        enabled.value = config.enabled || false
        customScheme.value = config.customScheme || ''
        authPageUrl.value = config.authPageUrl || '' // 直接使用后端生成的 URL
      }
    }

    const handleSave = async () => {
      saving.value = true

      const config = {
        enabled: enabled.value,
        customScheme: customScheme.value
      }

      const res = await updateOAuthConfigApi({
        appId: props.appId,
        oauthType: 'desktop',
        config: JSON.stringify(config)
      })

      if (res.code === 0) {
        ElMessage.success('保存成功')
      } else {
        ElMessage.error(res.msg || '保存失败')
      }

      saving.value = false
    }

    onMounted(() => {
      loadConfig()
    })

    return {
      enabled,
      customScheme,
      saving,
      authPageUrl,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.desktop-oauth {
  max-width: 800px;

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }

  pre {
    margin: 8px 0 0;
    padding: 12px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 12px;
    color: #303133;
  }

  code {
    padding: 2px 6px;
    background: #f4f4f5;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    color: #e6a23c;
  }
}
</style>
