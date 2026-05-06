<template>
  <div class="console-dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <img src="@/assets/icons/grid.svg" alt="" class="stat-icon-img" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.appCount }}</div>
              <div class="stat-label">我的应用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <img src="@/assets/icons/connection.svg" alt="" class="stat-icon-img" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayApiCalls }}</div>
              <div class="stat-label">今日 API 调用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #e6a23c">
              <img src="@/assets/icons/bell.svg" alt="" class="stat-icon-img" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayWebhooks }}</div>
              <div class="stat-label">今日 Webhook</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c">
              <img src="@/assets/icons/warning.svg" alt="" class="stat-icon-img" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.errorRate }}%</div>
              <div class="stat-label">错误率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速开始 -->
    <el-card class="quick-start-card" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>快速开始</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="quick-item" @click="$router.push('/console/apps')">
            <img src="@/assets/icons/plus.svg" alt="" class="quick-icon" />
            <h3>创建应用</h3>
            <p>创建你的第一个应用，获取 AppID 和 AppSecret</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="quick-item" @click="$router.push('/docs')">
            <img src="@/assets/icons/document.svg" alt="" class="quick-icon" />
            <h3>查看文档</h3>
            <p>阅读 API 文档，了解如何集成 Beaver IM</p>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="quick-item" @click="$router.push('/sdk')">
            <img src="@/assets/icons/download.svg" alt="" class="quick-icon" />
            <h3>下载 SDK</h3>
            <p>下载官方 SDK，快速开始开发</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- API 调用趋势图 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>API 调用趋势（最近7天）</span>
        </div>
      </template>
      <div class="chart-placeholder">
        <el-empty description="图表功能开发中" />
      </div>
    </el-card>

    <!-- 最近应用 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>最近应用</span>
          <el-button link type="primary" @click="$router.push('/console/apps')">
            查看全部
          </el-button>
        </div>
      </template>
      <el-table :data="recentApps" border>
        <el-table-column prop="name" label="应用名称" />
        <el-table-column prop="appId" label="AppID" width="280" />
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
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewAppDetail(row.appId)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAppListApi, type IAppInfo } from '@/api/app'

export default defineComponent({
  name: 'ConsoleDashboard',
  setup() {
    const router = useRouter()

    // 统计数据
    const stats = ref({
      appCount: 0,
      todayApiCalls: 0,
      todayWebhooks: 0,
      errorRate: 0
    })

    // 最近应用
    const recentApps = ref<IAppInfo[]>([])

    // 格式化时间
    const formatTime = (timestamp: number) => {
      if (!timestamp) return '-'
      const date = new Date(timestamp * 1000)
      return date.toLocaleString('zh-CN')
    }

    // 查看应用详情
    const viewAppDetail = (appId: string) => {
      router.push(`/console/app/${appId}`)
    }

    // 加载数据
    const loadData = async () => {
      try {
        const res = await getAppListApi({ page: 1, pageSize: 5 })
        recentApps.value = res.result.list
        stats.value.appCount = res.result.total
      } catch (error) {
        ElMessage.error('加载数据失败')
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      stats,
      recentApps,
      formatTime,
      viewAppDetail
    }
  }
})
</script>

<style scoped lang="less">
.console-dashboard {
  .stat-card {
    margin-bottom: 20px;
    
    .stat-content {
      display: flex;
      align-items: center;
      
      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        margin-right: 15px;

        .stat-icon-img {
          width: 30px;
          height: 30px;
          filter: brightness(0) invert(1);
        }
      }
      
      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
  
  .quick-start-card {
    .quick-item {
      text-align: center;
      padding: 30px 20px;
      border: 1px dashed #dcdfe6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        border-color: #409eff;
        background: #f5f7fa;
      }

      .quick-icon {
        width: 40px;
        height: 40px;
      }
      
      h3 {
        margin: 15px 0 10px;
        color: #303133;
      }
      
      p {
        margin: 0;
        color: #909399;
        font-size: 14px;
      }
    }
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .chart-placeholder {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
