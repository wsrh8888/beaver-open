<template>
  <div class="h5-oauth">
    <el-form label-width="140px">
      <el-form-item label="启用 H5 应用">
        <el-switch v-model="enabled" />
        <div class="form-tip">
          开启后，用户才能通过 H5 应用进行 OAuth 授权登录
        </div>
      </el-form-item>

      <el-form-item label="授权回调地址">
        <div v-for="(domain, index) in redirectDomains" :key="index" class="domain-item">
          <el-input 
            v-model="redirectDomains[index]" 
            placeholder="https://example.com/callback"
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
          添加回调地址
        </el-button>
        <div class="form-tip">
          用户授权后跳转的完整 URL，支持多个。如：https://example.com/callback、http://localhost:3000/callback
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
import { defineComponent, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { updateOAuthConfigApi } from '@/api/oauth'
import type { IGetOAuthConfigRes } from '@/types/api/oauth'

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
    },
    oauthConfig: {
      type: Object as () => IGetOAuthConfigRes,
      default: () => ({})
    }
  },
  setup(props) {
    const enabled = ref(false)
    const redirectDomains = ref<string[]>([])
    const jsSdkDomains = ref<string[]>([])
    const saving = ref(false)

    // 监听父组件传来的配置
    watch(
      () => props.oauthConfig?.h5Config,
      (config) => {
        if (config) {
          enabled.value = config.enabled || false
          // 直接使用完整的 redirectUris
          redirectDomains.value = config.redirectUris || []
          jsSdkDomains.value = config.jsSdkDomains || []
        }
      },
      { immediate: true }
    )

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

      // 过滤空值，直接使用用户输入的完整 URL
      const redirectUris = redirectDomains.value.filter(d => d.trim())

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
