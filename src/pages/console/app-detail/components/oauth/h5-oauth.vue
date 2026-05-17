<template>
  <div class="h5-oauth">
    <el-form label-width="140px">
      <el-form-item label="启用 H5 应用">
        <el-switch v-model="enabled" />
        <div class="form-tip">
          开启后，用户才能通过 H5 应用进行 OAuth 授权登录
        </div>
      </el-form-item>

      <el-form-item label="授权回调域名">
        <div v-for="(domain, index) in redirectDomains" :key="index" class="domain-item">
          <el-input 
            v-model="redirectDomains[index]" 
            placeholder="example.com"
          >
            <template #append>
              <el-button @click="removeDomain(index)" type="danger" text>
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <el-button text type="primary" @click="addDomain" style="margin-top: 8px">
          <el-icon><Plus /></el-icon>
          添加域名
        </el-button>
        <div class="form-tip">
          用户授权后跳转的域名，支持多个。如：example.com、oa.example.com
        </div>
      </el-form-item>

      <el-form-item label="JS-SDK 安全域名">
        <div v-for="(domain, index) in jsSdkDomains" :key="index" class="domain-item">
          <el-input 
            v-model="jsSdkDomains[index]" 
            placeholder="example.com"
          >
            <template #append>
              <el-button @click="removeJsSdkDomain(index)" type="danger" text>
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        <el-button text type="primary" @click="addJsSdkDomain">
          <el-icon><Plus /></el-icon>
          添加域名
        </el-button>
        <div class="form-tip">
          调用 Beaver JS-SDK 的页面所在域名，需与授权回调域名一致或为其子域名
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
import { Delete, Plus } from '@element-plus/icons-vue'
import { getOAuthConfigApi, updateOAuthConfigApi } from '@/api/oauth'

export default defineComponent({
  name: 'H5OAuth',
  components: {
    Delete,
    Plus
  },
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const enabled = ref(false)
    const redirectDomains = ref<string[]>([])
    const jsSdkDomains = ref<string[]>([])
    const saving = ref(false)

    const loadConfig = async () => {
      const res = await getOAuthConfigApi({ 
        appId: props.appId,
        oauthType: 'h5'
      })
      if (res.code === 0 && res.result?.h5Config) {
        const config = res.result.h5Config
        enabled.value = config.enabled || false
        // 从 redirectUris 提取域名
        redirectDomains.value = (config.redirectUris || []).map((uri: string) => {
          try {
            return new URL(uri).hostname
          } catch {
            return uri
          }
        })
        // JS-SDK 安全域名暂时使用相同的值
        jsSdkDomains.value = [...redirectDomains.value]
      }
    }

    const addDomain = () => {
      redirectDomains.value.push('')
    }

    const removeDomain = (index: number) => {
      redirectDomains.value.splice(index, 1)
    }

    const addJsSdkDomain = () => {
      jsSdkDomains.value.push('')
    }

    const removeJsSdkDomain = (index: number) => {
      jsSdkDomains.value.splice(index, 1)
    }

    const handleSave = async () => {
      saving.value = true

      // 将域名转换为完整的 URL（假设使用 https）
      const redirectUris = redirectDomains.value
        .filter(d => d.trim())
        .map(d => `https://${d.trim()}`)

      const config = {
        enabled: enabled.value,
        redirectUris,
        jsSdkDomains: jsSdkDomains.value.filter(d => d.trim())
      }

      const res = await updateOAuthConfigApi({
        appId: props.appId,
        oauthType: 'h5',
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
      redirectDomains,
      jsSdkDomains,
      saving,
      addDomain,
      removeDomain,
      addJsSdkDomain,
      removeJsSdkDomain,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.h5-oauth {
  max-width: 800px;

  .domain-item {
    margin-bottom: 8px;
  }

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }
}
</style>
