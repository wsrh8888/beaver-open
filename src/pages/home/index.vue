<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-open
  https://github.com/wsrh8888/beaver-open

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-open-header-v1
-->

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1 class="hero-title">Beaver 开放平台</h1>
        <p class="hero-subtitle">构建强大的 IM 应用生态</p>
        <p class="hero-desc">
          通过 Beaver 开放平台,您可以轻松集成即时通讯能力,
          打造智能机器人、自动化工作流和个性化应用
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="goToConsole">
            开始开发
          </el-button>
          <el-button size="large" @click="scrollToDocs">
            查看文档
          </el-button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">核心能力</h2>
        <el-row :gutter="30">
          <el-col :span="8">
            <el-card class="feature-card">
              <el-icon :size="50" color="#409eff"><ChatDotRound /></el-icon>
              <h3>消息推送</h3>
              <p>支持文本、图片、文件等多种消息类型,实现实时通讯</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card">
              <el-icon :size="50" color="#67c23a"><Connection /></el-icon>
              <h3>Bot 机器人</h3>
              <p>创建智能机器人,自动回复消息,提升用户体验</p>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card class="feature-card">
              <el-icon :size="50" color="#e6a23c"><Bell /></el-icon>
              <h3>事件订阅</h3>
              <p>实时接收消息、群成员变更等事件,快速响应</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>

    <!-- Quick Start Section -->
    <section class="quick-start">
      <div class="container">
        <h2 class="section-title">快速开始</h2>
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step title="注册账号" description="使用 IM 账号登录" />
          <el-step title="创建应用" description="获取 AppID 和 AppSecret" />
          <el-step title="调用 API" description="开始集成 IM 能力" />
          <el-step title="上线发布" description="审核通过后正式发布" />
        </el-steps>
        
        <div class="code-example">
          <el-card>
            <template #header>
              <span>示例代码 - 发送消息</span>
            </template>
            <pre><code class="language-javascript">{{ codeExample }}</code></pre>
          </el-card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>准备好开始了吗?</h2>
        <p>立即加入 Beaver 开放平台,开启您的 IM 应用开发之旅</p>
        <el-button type="primary" size="large" @click="goToConsole">
          免费开始
        </el-button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound, Connection, Bell } from '@element-plus/icons-vue'

const router = useRouter()
const activeStep = ref(0)

const codeExample = `// 1. 获取 access_token
const token = await fetch('/api/open/v1/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    app_id: 'your_app_id',
    app_secret: 'your_app_secret'
  })
})

// 2. 发送消息
await fetch('/api/open/v1/message/send', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token.access_token}\`
  },
  body: JSON.stringify({
    target_id: 'user_123',
    content: 'Hello, Beaver!',
    msg_type: 'text'
  })
})`

const goToConsole = () => {
  router.push('/console/dashboard')
}

const scrollToDocs = () => {
  router.push('/docs')
}

// 自动播放步骤
setInterval(() => {
  activeStep.value = (activeStep.value + 1) % 5
}, 3000)
</script>

<style scoped lang="less">
.home-page {
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 100px 0;
    text-align: center;
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .hero-title {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .hero-subtitle {
      font-size: 24px;
      margin-bottom: 20px;
      opacity: 0.9;
    }
    
    .hero-desc {
      font-size: 16px;
      max-width: 600px;
      margin: 0 auto 40px;
      line-height: 1.8;
      opacity: 0.8;
    }
    
    .hero-actions {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
  }
  
  .features {
    padding: 80px 0;
    background: #f5f7fa;
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .section-title {
      text-align: center;
      font-size: 36px;
      margin-bottom: 50px;
      color: #303133;
    }
    
    .feature-card {
      text-align: center;
      padding: 40px 20px;
      transition: transform 0.3s;
      
      &:hover {
        transform: translateY(-10px);
      }
      
      h3 {
        margin: 20px 0 10px;
        font-size: 20px;
        color: #303133;
      }
      
      p {
        color: #606266;
        line-height: 1.6;
      }
    }
  }
  
  .quick-start {
    padding: 80px 0;
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .section-title {
      text-align: center;
      font-size: 36px;
      margin-bottom: 50px;
      color: #303133;
    }
    
    .code-example {
      margin-top: 50px;
      
      pre {
        background: #282c34;
        color: #abb2bf;
        padding: 20px;
        border-radius: 8px;
        overflow-x: auto;
        
        code {
          font-family: 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
        }
      }
    }
  }
  
  .cta {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 0;
    text-align: center;
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    h2 {
      font-size: 36px;
      margin-bottom: 20px;
    }
    
    p {
      font-size: 18px;
      margin-bottom: 40px;
      opacity: 0.9;
    }
  }
}
</style>
