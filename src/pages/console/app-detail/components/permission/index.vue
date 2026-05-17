<template>
  <div class="permission-panel">
    <el-card shadow="never">
      <template #header>
        <div class="card-title-row">
          <div class="card-title">
            <img src="@/assets/icons/lock.svg" alt="" class="icon" />
            <span>可用权限列表</span>
          </div>
          <el-button type="primary" @click="handleSave" :loading="saving">
            <img src="@/assets/icons/check.svg" alt="" class="btn-icon" />
            保存权限
          </el-button>
        </div>
      </template>

      <el-empty v-if="!scopes || scopes.length === 0" description="暂无权限数据" />

      <div v-else class="permissions-list">
        <div 
          v-for="scope in scopes" 
          :key="scope.scope"
          class="permission-item"
          :class="{ 'is-required': scope.required }"
        >
          <el-checkbox 
            v-model="selectedScopes" 
            :value="scope.scope"
            :disabled="scope.required"
          >
            <div class="permission-content">
              <div class="permission-header">
                <strong class="permission-name">{{ scope.name }}</strong>
                <el-tag v-if="scope.required" size="small" type="warning">必需</el-tag>
                <el-tag v-if="scope.enabled" size="small" type="success">已启用</el-tag>
              </div>
              <p class="permission-desc">{{ scope.description }}</p>
            </div>
          </el-checkbox>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppScopesApi, updateAppScopesApi, type IScopeInfo } from '@/api/scope'

export default defineComponent({
  name: 'PermissionPanel',
  props: {
    appId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const scopes = ref<IScopeInfo[]>([])
    const selectedScopes = ref<string[]>([])
    const saving = ref(false)
    const loading = ref(false)

    // 加载权限列表
    const loadPermissions = async () => {
      loading.value = true
      const res = await getAppScopesApi({ appId: props.appId })
      if (res.code === 0) {
        scopes.value = res.result.scopes
        selectedScopes.value = res.result.scopes
          .filter(s => s.enabled)
          .map(s => s.scope)
      }
      loading.value = false
    }

    // 保存权限配置
    const handleSave = async () => {
      await ElMessageBox.confirm('确认保存权限配置?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })

      saving.value = true
      const res = await updateAppScopesApi({
        appId: props.appId,
        scopes: selectedScopes.value
      })
      if (res.code === 0) {
        ElMessage.success('权限保存成功')
        await loadPermissions()
      }
      saving.value = false
    }

    onMounted(() => {
      loadPermissions()
    })

    return {
      scopes,
      selectedScopes,
      saving,
      loading,
      handleSave
    }
  }
})
</script>

<style scoped lang="less">
.permission-panel {
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

  .card-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

    .btn-icon {
      width: 16px;
      height: 16px;
    }
  }

  .permissions-list {
    .permission-item {
      padding: var(--spacing-md);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-md);
      transition: all 0.2s;

      &:hover {
        border-color: var(--primary);
        background: rgba(255, 125, 69, 0.02);
      }

      &.is-required {
        background: rgba(255, 193, 7, 0.04);
        border-color: rgba(255, 193, 7, 0.2);
      }

      .permission-content {
        margin-left: var(--spacing-sm);

        .permission-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xs);

          .permission-name {
            font-size: 14px;
            color: var(--text-primary);
          }
        }

        .permission-desc {
          font-size: 12px;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
