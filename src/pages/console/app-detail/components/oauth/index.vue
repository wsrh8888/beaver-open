<template>
  <div class="oauth-panel">
    <el-tabs v-model="activeTab" type="card">
      <!-- Tab 1: H5 应用 -->
      <el-tab-pane label="H5 应用" name="h5">
        <H5OAuth :app-id="appId" />
      </el-tab-pane>

      <!-- Tab 2: 桌面端应用 -->
      <el-tab-pane label="桌面端应用" name="desktop">
        <DesktopOAuth :app-id="appId" />
      </el-tab-pane>

    </el-tabs>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import H5OAuth from './h5-oauth.vue'
import DesktopOAuth from './desktop-oauth.vue'
import MobileOAuth from './mobile-oauth.vue'

export default defineComponent({
  name: 'OAuthPanel',
  components: {
    H5OAuth,
    DesktopOAuth,
    MobileOAuth
  },
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup() {
    const activeTab = ref('h5')

    return {
      activeTab
    }
  }
})
</script>

<style scoped lang="less">
.oauth-panel {
  padding: 24px;
  height: 100%;

  :deep(.el-tabs) {
    height: 100%;
  }

  :deep(.el-tabs__content) {
    padding-top: 20px;
  }
}
</style>
