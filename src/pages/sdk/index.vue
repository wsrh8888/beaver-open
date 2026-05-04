<template>
  <div class="sdk-page">
    <div class="container">
      <h1 class="page-title">SDK 下载</h1>
      <p class="page-desc">多语言 SDK,快速集成 Beaver IM 能力</p>

      <el-row :gutter="30" class="sdk-list">
        <!-- JavaScript/TypeScript SDK -->
        <el-col :span="8">
          <el-card class="sdk-card" shadow="hover">
            <div class="sdk-icon js">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" />
            </div>
            <h3>JavaScript / TypeScript</h3>
            <p class="sdk-version">v1.2.0</p>
            <p class="sdk-desc">适用于 Web、Node.js 环境</p>
            
            <div class="install-code">
              <code>npm install @beaver/im-sdk</code>
            </div>
            
            <div class="sdk-actions">
              <el-button type="primary" @click="copyInstall('npm install @beaver/im-sdk')">
                复制安装命令
              </el-button>
              <el-button @click="viewDocs('js')">
                查看文档
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- Python SDK -->
        <el-col :span="8">
          <el-card class="sdk-card" shadow="hover">
            <div class="sdk-icon python">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" />
            </div>
            <h3>Python</h3>
            <p class="sdk-version">v1.1.5</p>
            <p class="sdk-desc">适用于 Python 3.7+</p>
            
            <div class="install-code">
              <code>pip install beaver-im</code>
            </div>
            
            <div class="sdk-actions">
              <el-button type="primary" @click="copyInstall('pip install beaver-im')">
                复制安装命令
              </el-button>
              <el-button @click="viewDocs('python')">
                查看文档
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- Go SDK -->
        <el-col :span="8">
          <el-card class="sdk-card" shadow="hover">
            <div class="sdk-icon go">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg" alt="Go" />
            </div>
            <h3>Go</h3>
            <p class="sdk-version">v1.0.8</p>
            <p class="sdk-desc">适用于 Go 1.18+</p>
            
            <div class="install-code">
              <code>go get github.com/beaver/im-sdk-go</code>
            </div>
            
            <div class="sdk-actions">
              <el-button type="primary" @click="copyInstall('go get github.com/beaver/im-sdk-go')">
                复制安装命令
              </el-button>
              <el-button @click="viewDocs('go')">
                查看文档
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- Java SDK -->
        <el-col :span="8">
          <el-card class="sdk-card" shadow="hover">
            <div class="sdk-icon java">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" />
            </div>
            <h3>Java</h3>
            <p class="sdk-version">v1.0.6</p>
            <p class="sdk-desc">适用于 Java 8+</p>
            
            <div class="install-code">
              <code>&lt;dependency&gt;
  &lt;groupId&gt;com.beaver&lt;/groupId&gt;
  &lt;artifactId&gt;im-sdk&lt;/artifactId&gt;
  &lt;version&gt;1.0.6&lt;/version&gt;
&lt;/dependency&gt;</code>
            </div>
            
            <div class="sdk-actions">
              <el-button type="primary" @click="copyInstall('Maven dependency')">
                复制 Maven 配置
              </el-button>
              <el-button @click="viewDocs('java')">
                查看文档
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- iOS SDK -->
        <el-col :span="8">
          <el-card class="sdk-card" shadow="hover">
            <div class="sdk-icon ios">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" alt="iOS" />
            </div>
            <h3>iOS (Swift)</h3>
            <p class="sdk-version">v1.0.3</p>
            <p class="sdk-desc">适用于 iOS 12+</p>
            
            <div class="install-code">
              <code>pod 'BeaverIM', '~> 1.0.3'</code>
            </div>
            
            <div class="sdk-actions">
              <el-button type="primary" @click="copyInstall(`pod 'BeaverIM', '~> 1.0.3'`)">
                复制 Podfile 配置
              </el-button>
              <el-button @click="viewDocs('ios')">
                查看文档
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- Android SDK -->
        <el-col :span="8">
          <el-card class="sdk-card" shadow="hover">
            <div class="sdk-icon android">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" alt="Android" />
            </div>
            <h3>Android (Kotlin)</h3>
            <p class="sdk-version">v1.0.4</p>
            <p class="sdk-desc">适用于 Android 5.0+</p>
            
            <div class="install-code">
              <code>implementation 'com.beaver:im-sdk:1.0.4'</code>
            </div>
            
            <div class="sdk-actions">
              <el-button type="primary" @click="copyInstall(`implementation 'com.beaver:im-sdk:1.0.4'`)">
                复制 Gradle 配置
              </el-button>
              <el-button @click="viewDocs('android')">
                查看文档
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 示例代码 -->
      <el-card class="example-section" style="margin-top: 40px">
        <template #header>
          <h3>快速开始示例</h3>
        </template>
        
        <el-tabs v-model="activeExample">
          <el-tab-pane label="JavaScript" name="js">
            <pre><code>{{ jsExample }}</code></pre>
          </el-tab-pane>
          <el-tab-pane label="Python" name="python">
            <pre><code>{{ pythonExample }}</code></pre>
          </el-tab-pane>
          <el-tab-pane label="Go" name="go">
            <pre><code>{{ goExample }}</code></pre>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeExample = ref('js')

const copyInstall = (command: string) => {
  navigator.clipboard.writeText(command).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}

const viewDocs = (lang: string) => {
  ElMessage.info(`${lang.toUpperCase()} 详细文档开发中`)
}

const jsExample = `import { BeaverIM } from '@beaver/im-sdk'

// 初始化 SDK
const im = new BeaverIM({
  appId: 'your_app_id',
  appSecret: 'your_app_secret'
})

// 获取 access_token
const token = await im.getAccessToken()

// 发送消息
const result = await im.sendMessage({
  targetId: 'user_123',
  content: 'Hello, Beaver!',
  msgType: 'text'
})

console.log('消息 ID:', result.messageId)`

const pythonExample = `from beaver_im import BeaverIM

# 初始化 SDK
im = BeaverIM(
    app_id='your_app_id',
    app_secret='your_app_secret'
)

# 获取 access_token
token = im.get_access_token()

# 发送消息
result = im.send_message(
    target_id='user_123',
    content='Hello, Beaver!',
    msg_type='text'
)

print(f'消息 ID: {result.message_id}')`

const goExample = `package main

import (
    "fmt"
    beaverim "github.com/beaver/im-sdk-go"
)

func main() {
    // 初始化 SDK
    im := beaverim.New(beaverim.Config{
        AppID:     "your_app_id",
        AppSecret: "your_app_secret",
    })

    // 获取 access_token
    token, err := im.GetAccessToken()
    if err != nil {
        panic(err)
    }

    // 发送消息
    result, err := im.SendMessage(beaverim.Message{
        TargetID: "user_123",
        Content:  "Hello, Beaver!",
        MsgType:  "text",
    })
    if err != nil {
        panic(err)
    }

    fmt.Printf("消息 ID: %s\\n", result.MessageID)
}`
</script>

<style scoped lang="less">
.sdk-page {
  min-height: calc(100vh - 60px);
  background: #f5f7fa;
  padding: 40px 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .page-title {
    font-size: 36px;
    color: #303133;
    text-align: center;
    margin-bottom: 10px;
  }

  .page-desc {
    font-size: 18px;
    color: #606266;
    text-align: center;
    margin-bottom: 50px;
  }

  .sdk-list {
    .sdk-card {
      text-align: center;
      padding: 30px 20px;
      transition: transform 0.3s;
      height: 100%;

      &:hover {
        transform: translateY(-10px);
      }

      .sdk-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #f5f7fa;

        img {
          width: 50px;
          height: 50px;
        }

        &.js {
          background: #f9e64c20;
        }

        &.python {
          background: #3776ab20;
        }

        &.go {
          background: #00add820;
        }

        &.java {
          background: #f8982020;
        }

        &.ios {
          background: #00000010;
        }

        &.android {
          background: #3ddc8420;
        }
      }

      h3 {
        font-size: 20px;
        color: #303133;
        margin-bottom: 10px;
      }

      .sdk-version {
        color: #409eff;
        font-weight: bold;
        margin-bottom: 10px;
      }

      .sdk-desc {
        color: #909399;
        font-size: 14px;
        margin-bottom: 20px;
      }

      .install-code {
        background: #282c34;
        color: #abb2bf;
        padding: 15px;
        border-radius: 6px;
        margin-bottom: 20px;
        overflow-x: auto;

        code {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.5;
          display: block;
        }
      }

      .sdk-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    }
  }

  .example-section {
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
</style>
