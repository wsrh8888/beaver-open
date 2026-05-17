<template>
  <div class="dashboard-container">
    <div class="welcome-card">
      <h1>欢迎使用 Beaver 开放平台</h1>
      <p class="subtitle">快速构建企业级应用</p>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/icons/app.svg" alt="" />
          </div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">我的应用</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/icons/chat.svg" alt="" />
          </div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">机器人</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <img src="@/assets/icons/key.svg" alt="" />
          </div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">OAuth 应用</div>
          </div>
        </div>
      </div>
      
      <div class="quick-actions">
        <el-button type="primary" size="large" @click="$router.push('/console/apps')">
          <img src="@/assets/icons/plus.svg" alt="" class="btn-icon" />
          创建应用
        </el-button>
        <el-button size="large" @click="$router.push('/developer/apply')">
          开发者认证
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Dashboard'
})
</script>

<style scoped lang="less">
.dashboard-container {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 8px;
  }
  
  .subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin: 0 0 40px;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  
  .stat-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-light);
    border-radius: var(--radius-sm);
    
    img {
      width: 24px;
      height: 24px;
    }
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

.quick-actions {
  display: flex;
  gap: 16px;
  
  .btn-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
  }
}
</style>
