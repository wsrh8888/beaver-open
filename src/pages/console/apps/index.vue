<template>
  <div class="open-apps-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>应用管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            创建应用
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="应用名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入应用名称"
            clearable
            @clear="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="appList"
        border
        style="width: 100%"
      >
        <el-table-column prop="appId" label="AppID" width="280" />
        <el-table-column prop="name" label="应用名称" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleConfig(row)">
              配置
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </el-card>

    <!-- 创建/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入应用描述"
          />
        </el-form-item>
        <el-form-item label="图标URL" prop="icon">
          <el-input
            v-model="formData.icon"
            placeholder="请输入应用图标URL（可选）"
          />
        </el-form-item>
        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import {
  getAppListApi,
  createAppApi,
  updateAppApi,
  deleteAppApi,
  getAppDetailApi,
  type IAppInfo,
  type ICreateAppReq,
  type IUpdateAppReq
} from '@/api/app'

export default defineComponent({
  name: 'OpenApps',
  setup() {
    const router = useRouter()
    
    // 数据
    const loading = ref(false)
    const appList = ref<IAppInfo[]>([])
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    })

    const searchForm = reactive({
      keyword: '',
      status: undefined as number | undefined
    })

    // 表单相关
    const dialogVisible = ref(false)
    const dialogTitle = ref('创建应用')
    const isEdit = ref(false)
    const submitLoading = ref(false)
    const formRef = ref<FormInstance>()

    const formData = reactive({
      appId: '',
      name: '',
      description: '',
      icon: '',
      status: 1
    })

    const formRules: FormRules = {
      name: [
        { required: true, message: '请输入应用名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
      ]
    }

    // 格式化时间
    const formatTime = (timestamp: number) => {
      if (!timestamp) return '-'
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN')
    }

    // 加载应用列表
    const loadAppList = async () => {
      loading.value = true
      const res = await getAppListApi({
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: searchForm.status
      })
      if (res.code === 0) {
        appList.value = res.result.list
        pagination.total = res.result.total
      }
      loading.value = false
    }

    // 搜索
    const handleSearch = () => {
      pagination.page = 1
      loadAppList()
    }

    // 重置
    const handleReset = () => {
      searchForm.keyword = ''
      searchForm.status = undefined
      handleSearch()
    }

    // 分页
    const handleSizeChange = () => {
      loadAppList()
    }

    const handlePageChange = () => {
      loadAppList()
    }

    // 创建应用
    const handleCreate = () => {
      isEdit.value = false
      dialogTitle.value = '创建应用'
      resetForm()
      dialogVisible.value = true
    }

    // 配置应用（跳转到详情页）
    const handleConfig = (row: IAppInfo) => {
      router.push(`/console/app/${row.appId}`)
    }

    // 删除应用
    const handleDelete = (row: IAppInfo) => {
      ElMessageBox.confirm(
        `确定要删除应用 "${row.name}" 吗？此操作不可恢复！`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await deleteAppApi({ appId: row.appId })
          ElMessage.success('删除成功')
          loadAppList()
        } catch (error) {
          ElMessage.error('删除失败')
        }
      }).catch(() => {})
    }

    // 提交表单
    const handleSubmit = async () => {
      if (!formRef.value) return
      
      await formRef.value.validate(async (valid) => {
        if (!valid) return
        
        submitLoading.value = true
        if (isEdit.value) {
          const res = await updateAppApi({
            appId: formData.appId,
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            status: formData.status
          })
          if (res.code === 0) {
            ElMessage.success('更新成功')
          }
        } else {
          const res = await createAppApi({
            name: formData.name,
            description: formData.description,
            icon: formData.icon
          })
          if (res.code === 0) {
            ElMessage.success('创建成功')
          }
        }
        dialogVisible.value = false
        loadAppList()
        submitLoading.value = false
      })
    }

    // 重置表单
    const resetForm = () => {
      formData.appId = ''
      formData.name = ''
      formData.description = ''
      formData.icon = ''
      formData.status = 1
      formRef.value?.clearValidate()
    }

    // 关闭对话框
    const handleDialogClose = () => {
      resetForm()
    }

    onMounted(() => {
      loadAppList()
    })

    return {
      loading,
      appList,
      pagination,
      searchForm,
      dialogVisible,
      dialogTitle,
      isEdit,
      submitLoading,
      formRef,
      formData,
      formRules,
      formatTime,
      handleSearch,
      handleReset,
      handleSizeChange,
      handlePageChange,
      handleCreate,
      handleConfig,
      handleDelete,
      handleSubmit,
      handleDialogClose
    }
  }
})
</script>

<style scoped lang="less">
.open-apps-container {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .search-form {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
