<template>
  <div class="security-panel">
    <el-card shadow="never" class="security-card">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/shield.svg" alt="" class="icon" />
          <span>IP 白名单</span>
        </div>
      </template>

      <el-form label-width="120px">
        <el-form-item label="IP 白名单">
          <div v-for="(ip, index) in securityConfig.ipWhitelist" :key="index" class="ip-item">
            <el-input 
              v-model="securityConfig.ipWhitelist[index]" 
              placeholder="如：192.168.1.1 或 192.168.1.0/24"
            >
              <template #append>
                <el-button @click="removeIp(index)" type="danger" text>
                  <img src="@/assets/icons/delete.svg" alt="" class="btn-icon" />
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button text type="primary" @click="addIp" style="margin-top: 8px">
            <img src="@/assets/icons/plus.svg" alt="" class="btn-icon" />
            添加 IP
          </el-button>
          <div class="form-tip">
            留空表示不限制 IP。支持单个 IP（如 192.168.1.1）或 CIDR 格式（如 192.168.1.0/24）
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="security-card">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/link.svg" alt="" class="icon" />
          <span>OAuth 重定向 URL</span>
        </div>
      </template>

      <el-form label-width="120px">
        <el-form-item label="重定向 URL">
          <div v-for="(url, index) in securityConfig.redirectUrls" :key="index" class="url-item">
            <el-input 
              v-model="securityConfig.redirectUrls[index]" 
              placeholder="https://your-domain.com/callback"
            >
              <template #append>
                <el-button @click="removeUrl(index)" type="danger" text>
                  <img src="@/assets/icons/delete.svg" alt="" class="btn-icon" />
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button text type="primary" @click="addUrl" style="margin-top: 8px">
            <img src="@/assets/icons/plus.svg" alt="" class="btn-icon" />
            添加 URL
          </el-button>
          <div class="form-tip">
            OAuth 授权后跳转的地址，必须与 OAuth 配置中的回调地址一致
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="security-card">
      <template #header>
        <div class="card-title">
          <img src="@/assets/icons/globe.svg" alt="" class="icon" />
          <span>H5 可信域名</span>
        </div>
      </template>

      <el-form label-width="120px">
        <el-form-item label="可信域名">
          <el-input
            v-model="securityConfig.h5Domains"
            type="textarea"
            :rows="4"
            placeholder="每行一个域名，如：&#10;example.com&#10;sub.example.com"
          />
          <div class="form-tip">
            用于嵌入网页应用的域名白名单，每行一个域名
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave" :loading="saving">
            保存安全设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSecurityConfigApi, updateSecurityConfigApi } from '@/api/security'

interface ISecurityConfig {
  ipWhitelist: string[]
  redirectUrls: string[]
  h5Domains: string
}

export default defineComponent({
  name: 'SecurityPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const securityConfig = reactive<ISecurityConfig>({
      ipWhitelist: [],
      redirectUrls: [],
      h5Domains: ''
    })
    const saving = ref(false)
    const loading = ref(false)

    // 加载安全配置
    const loadSecurityConfig = async () => {
      loading.value = true
      const res = await getSecurityConfigApi({ appId: props.appId })
      if (res.code === 0 && res.result?.config) {
        const config = res.result.config
        securityConfig.ipWhitelist = config.ipWhitelist || []
        securityConfig.redirectUrls = config.redirectUris || []
        securityConfig.h5Domains = config.trustedDomains?.join(',') || ''
      }
      loading.value = false
    }

    const addIp = () => {
      securityConfig.ipWhitelist.push('')
    }

    const removeIp = (index: number) => {
      securityConfig.ipWhitelist.splice(index, 1)
    }

    const addUrl = () => {
      securityConfig.redirectUrls.push('')
    }

    const removeUrl = (index: number) => {
      securityConfig.redirectUrls.splice(index, 1)
    }

    // 保存安全设置
    const handleSave = async () => {
      saving.value = true
      
      // 验证 IP 格式
      for (const ip of securityConfig.ipWhitelist) {
        if (ip && !isValidIpOrCidr(ip)) {
          ElMessage.warning(`IP 地址格式不正确：${ip}`)
          saving.value = false
          return
        }
      }

      const res = await updateSecurityConfigApi({
        appId: props.appId,
        ipWhitelist: securityConfig.ipWhitelist.filter(ip => ip.trim()),
        redirectUris: securityConfig.redirectUrls.filter(url => url.trim()),
        trustedDomains: securityConfig.h5Domains.split(',').map(d => d.trim()).filter(d => d)
      })
      
      if (res.code === 0) {
        ElMessage.success('保存成功')
      }
      saving.value = false
    }

    // 验证 IP 或 CIDR 格式
    const isValidIpOrCidr = (ip: string): boolean => {
      // 简单的 IP/CIDR 验证正则
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
      if (!ipRegex.test(ip)) return false
      
      // 检查每个数字是否在 0-255 范围内
      const parts = ip.split('/')[0].split('.')
      for (const part of parts) {
        const num = parseInt(part)
        if (num < 0 || num > 255) return false
      }
      
      return true
    }

    onMounted(() => {
      loadSecurityConfig()
    })

    return {
      securityConfig,
      saving,
      loading,
      addIp,
      removeIp,
      addUrl,
      removeUrl,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.security-panel {
  max-height: calc(100vh - 180px);
  overflow-y: auto;

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

  .security-card {
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);

    :deep(.el-card__header) {
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
    }

    :deep(.el-card__body) {
      padding: var(--spacing-lg);
    }
  }

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

  .form-tip {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 4px;
    line-height: 1.5;
  }

  .ip-item,
  .url-item {
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
</style>
