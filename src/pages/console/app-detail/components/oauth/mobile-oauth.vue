<template>
  <div class="mobile-oauth">
    <el-form label-width="140px">
      <el-form-item label="启用移动端应用">
        <el-switch v-model="enabled" />
        <div class="form-tip">
          开启后，用户才能通过移动应用进行 OAuth 授权登录
        </div>
      </el-form-item>

      <el-form-item label="iOS Bundle ID">
        <el-input 
          v-model="iosBundleId" 
          placeholder="com.example.app"
        />
      </el-form-item>

      <el-form-item label="Android Package Name">
        <el-input 
          v-model="androidPackageName" 
          placeholder="com.example.app"
        />
      </el-form-item>

      <el-form-item label="Universal Link (iOS)">
        <el-input 
          v-model="universalLink" 
          placeholder="https://your-domain.com/universal-link/"
        />
        <div class="form-tip">
          iOS Universal Link，可选。如果不填则使用自定义 Scheme
        </div>
      </el-form-item>

      <el-form-item label="自定义 Scheme">
        <el-input 
          v-model="customScheme" 
          placeholder="beaver://oauth/callback"
        />
        <div class="form-tip">
          移动端回调协议，如：beaver://oauth/callback
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
  name: 'MobileOAuth',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const enabled = ref(false)
    const iosBundleId = ref('')
    const androidPackageName = ref('')
    const universalLink = ref('')
    const customScheme = ref('')
    const saving = ref(false)

    const loadConfig = async () => {
      const res = await getOAuthConfigApi({
        appId: props.appId
      })
      if (res.code === 0 && res.result?.mobileConfig) {
        const config = res.result.mobileConfig
        enabled.value = config.enabled || false
        iosBundleId.value = config.iosBundleId || ''
        androidPackageName.value = config.androidPackageName || ''
        universalLink.value = config.universalLink || ''
        customScheme.value = config.customScheme || ''
      }
    }

    const handleSave = async () => {
      saving.value = true

      const config = {
        enabled: enabled.value,
        iosBundleId: iosBundleId.value,
        androidPackageName: androidPackageName.value,
        universalLink: universalLink.value,
        customScheme: customScheme.value
      }

      const res = await updateOAuthConfigApi({
        appId: props.appId,
        oauthType: 'mobile',
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
      iosBundleId,
      androidPackageName,
      universalLink,
      customScheme,
      saving,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.mobile-oauth {
  max-width: 800px;

  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    line-height: 1.5;
  }
}
</style>
