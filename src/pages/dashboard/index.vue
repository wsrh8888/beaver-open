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
  <div class="dashboard-container">
    <div class="page-header">
      <div>
        <h1 class="page-header__title">控制台</h1>
        <p class="page-header__desc">按能力管理开放平台资源，各模块彼此独立</p>
      </div>
      <div class="page-header__actions">
        <el-button @click="reloadAll">刷新</el-button>
      </div>
    </div>

    <section v-for="group in groups" :key="group.title" class="overview-group">
      <h2 class="overview-group__title">{{ group.title }}</h2>
      <div class="ds-overview-grid">
        <div v-for="card in group.cards" :key="card.path" class="capability-card">
          <div class="capability-card__head">
            <h3>{{ card.title }}</h3>
            <el-button link type="primary" @click="go(card.path)">进入</el-button>
          </div>
          <p class="capability-card__desc">{{ card.desc }}</p>
          <div class="capability-card__count">
            <span class="count-num">{{ card.count }}</span>
            <span class="count-label">个{{ card.unit }}</span>
          </div>
          <div class="capability-card__recent">
            <span v-if="card.loading" class="ds-hint">加载中…</span>
            <span v-else-if="card.failed" class="ds-hint">加载失败，可点击右上角刷新</span>
            <span v-else-if="card.recent.length === 0" class="ds-hint">暂无{{ card.unit }}</span>
            <span v-else class="ds-hint">最近：{{ card.recent.join("、") }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive } from "vue"
import { useRouter } from "vue-router"
import { getOAuthAppListApi } from "@/api/oauth"
import { listBotsApi } from "@/api/bot"
import { listDigitalsApi } from "@/api/digital"

interface CapabilityCard {
  title: string
  desc: string
  unit: string
  path: string
  count: number
  recent: string[]
  loading: boolean
  failed: boolean
}

export default defineComponent({
  name: "Dashboard",
  setup() {
    const router = useRouter()

    // 与侧栏分组保持一致：一级是能力分组，二级是独立模块
    const groups = reactive<{ title: string; cards: CapabilityCard[] }[]>([
      {
        title: "身份与接入",
        cards: [
          {
            title: "OAuth 登录",
            desc: "OAuth 应用、凭证与各端接入配置",
            unit: "应用",
            path: "/oauth",
            count: 0,
            recent: [],
            loading: false,
            failed: false
          }
        ]
      },
      {
        title: "机器人能力",
        cards: [
          {
            title: "推送机器人",
            desc: "Incoming Webhook 群通知、凭据与可见范围",
            unit: "机器人",
            path: "/bots",
            count: 0,
            recent: [],
            loading: false,
            failed: false
          },
                {
        title: "智能体",
        desc: "数字伙伴、运行方式与编排配置",
        unit: "数字伙伴",
        path: "/digitals",
        count: 0,
        recent: [],
        loading: false,
        failed: false
      }
    ]
  }
])

    const loadCapability = async (card: CapabilityCard, fetcher: () => Promise<any>) => {
      card.loading = true
      card.failed = false
      try {
        const res = await fetcher()
        card.count = res?.result?.total ?? 0
        card.recent = (res?.result?.list ?? [])
          .map((item: any) => item?.name)
          .filter(Boolean)
          .slice(0, 3)
      } catch {
        card.failed = true
        card.count = 0
        card.recent = []
      } finally {
        card.loading = false
      }
    }

    const reloadAll = () => {
      loadCapability(groups[0].cards[0], () => getOAuthAppListApi({ page: 1, pageSize: 3 }))
      loadCapability(groups[1].cards[0], () => listBotsApi({ page: 1, pageSize: 3 }))
      loadCapability(groups[1].cards[1], () => listDigitalsApi({ page: 1, pageSize: 3 }))
    }

    const go = (path: string) => router.push(path)

    onMounted(reloadAll)

    return { groups, reloadAll, go }
  }
})
</script>

<style scoped lang="less">
.dashboard-container {
  max-width: 1100px;
}

.overview-group {
  & + & { margin-top: var(--ds-space-8); }

  &__title {
    font-size: var(--ds-fs-13);
    font-weight: var(--ds-weight-medium);
    color: var(--ds-neutral-600);
    margin-bottom: var(--ds-space-3);
  }
}

.capability-card {
  background: var(--ds-neutral-0);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: var(--ds-space-5);
  min-height: 156px;
  display: flex;
  flex-direction: column;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: var(--ds-fs-16);
      font-weight: var(--ds-weight-medium);
      color: var(--ds-neutral-900);
    }
  }

  &__desc {
    margin-top: var(--ds-space-2);
    font-size: var(--ds-fs-13);
    line-height: var(--ds-lh-body);
    color: var(--ds-neutral-600);
  }

  &__count {
    margin-top: auto;
    padding-top: var(--ds-space-4);
    display: flex;
    align-items: baseline;
    gap: var(--ds-space-2);
  }

  &__recent {
    margin-top: var(--ds-space-2);
  }
}

.count-num {
  font-size: var(--ds-fs-24);
  font-weight: var(--ds-weight-medium);
  color: var(--ds-neutral-900);
}
.count-label {
  font-size: var(--ds-fs-13);
  color: var(--ds-neutral-600);
}
</style>
