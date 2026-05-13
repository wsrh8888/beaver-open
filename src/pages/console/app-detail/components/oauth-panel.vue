<template>
  <div class="oauth-panel">
    <el-card shadow="never">
      <el-form label-width="120px" class="config-form">
        <el-form-item label="重定向 URL">
          <div v-for="(uri, index) in localConfig.redirectUris" :key="index" class="redirect-uri-item">
            <el-input 
              v-model="localConfig.redirectUris[index]" 
              placeholder="https://your-site.com/callback"
            >
              <template #append>
                <el-button @click="removeRedirectUri(index)" type="danger" text>
                  <img src="@/assets/icons/delete.svg" alt="" class="btn-icon" />
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button text type="primary" @click="addRedirectUri" style="margin-top: 8px">
            <img src="@/assets/icons/plus.svg" alt="" class="btn-icon" />
            添加重定向 URL
          </el-button>
          <div class="form-tip">授权回调地址，支持多个</div>
        </el-form-item>

        <el-form-item label="IP 白名单（可选）">
          <el-input 
            v-model="localConfig.ipWhitelist" 
            type="textarea"
            :rows="3"
            placeholder="192.168.1.1, 10.0.0.1"
          />
          <div class="form-tip">限制服务端 API 调用的源 IP，留空不限制</div>
        </el-form-item>

        <el-form-item label="H5 可信域名（可选）">
          <div v-for="(domain, index) in localConfig.h5TrustedDomains" :key="index" class="redirect-uri-item">
            <el-input 
              v-model="localConfig.h5TrustedDomains[index]" 
              placeholder="https://your-domain.com"
            >
              <template #append>
                <el-button @click="removeH5Domain(index)" type="danger" text>
                  <img src="@/assets/icons/delete.svg" alt="" class="btn-icon" />
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button text type="primary" @click="addH5Domain" style="margin-top: 8px">
            <img src="@/assets/icons/plus.svg" alt="" class="btn-icon" />
            添加 H5 可信域名
          </el-button>
          <div class="form-tip">嵌入 IM 客户端的 H5 应用需配置</div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存配置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getOAuthConfigApi, updateOAuthConfigApi } from '@/api/oauth'

interface IOAuthConfig {
  redirectUris: string[]
  ipWhitelist: string
  h5TrustedDomains: string[]
}

export default defineComponent({
  name: 'OAuthPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const localConfig = reactive<IOAuthConfig>({
      redirectUris: [],
      ipWhitelist: '',
      h5TrustedDomains: []
    })
    const saving = ref(false)
    const loading = ref(false)

    // 加载 OAuth 配置
    const loadOAuthConfig = async () => {
      loading.value = true
      const res = await getOAuthConfigApi({ appId: props.appId })
      if (res.code === 0 && res.result?.config) {
        Object.assign(localConfig, {
          redirectUris: res.result.config.redirectUris || [],
          ipWhitelist: res.result.config.ipWhitelist || '',
          h5TrustedDomains: res.result.config.h5TrustedDomains || []
        })
      }
      loading.value = false
    }

    const addRedirectUri = () => {
      localConfig.redirectUris.push('')
    }

    const removeRedirectUri = (index: number) => {
      localConfig.redirectUris.splice(index, 1)
    }

    const addH5Domain = () => {
      localConfig.h5TrustedDomains.push('')
    }

    const removeH5Domain = (index: number) => {
      localConfig.h5TrustedDomains.splice(index, 1)
    }

    const handleSave = async () => {
      if (localConfig.redirectUris.length === 0) {
        ElMessage.warning('请至少添加一个重定向 URL')
        return
      }
      
      for (const uri of localConfig.redirectUris) {
        if (!uri) {
          ElMessage.warning('请输入有效的重定向 URL')
          return
        }
      }
      
      // 验证 H5 可信域名
      for (const domain of localConfig.h5TrustedDomains) {
        if (domain && !domain.startsWith('http')) {
          ElMessage.warning('H5 可信域名必须以 http 或 https 开头')
          return
        }
      }
      
      saving.value = true
      const res = await updateOAuthConfigApi({
        appId: props.appId,
        redirectUris: localConfig.redirectUris,
        ipWhitelist: localConfig.ipWhitelist,
        h5TrustedDomains: localConfig.h5TrustedDomains
      })
      if (res.code === 0) {
        ElMessage.success('OAuth 配置保存成功')
        await loadOAuthConfig()
      }
      saving.value = false
    }

    onMounted(() => {
      loadOAuthConfig()
    })

    return {
      localConfig,
      saving,
      loading,
      addRedirectUri,
      removeRedirectUri,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.oauth-panel {
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

  .config-form {
    .form-tip {
      font-size: 12px;
      color: var(--text-tertiary);
      margin-top: 4px;
      line-height: 1.5;
    }

    .redirect-uri-item {
      margin-bottom: var(--spacing-sm);

      &:last-child {
        margin-bottom: 0;
      }
    }

    .btn-icon {
      width: 16px;
      height: 16px;
    }
  }

  .code-example-card {
    margin-top: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    .card-title {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);

      .icon {
        width: 20px;
        height: 20px;
        color: var(--primary);
      }
    }

    .code-block {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: var(--spacing-md);
      border-radius: var(--radius-sm);
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }
  }
}
</style>
