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

  端配置：先勾选要接入的端，勾上哪个才出现哪个的配置卡。
  勾选状态本身就是各端的 enabled 字段，改动立即落库（关掉一个端不用再点保存）。
-->

<template>
  <div v-loading="loading">
    <FormCard title="接入端" desc="勾选允许发起 OAuth 授权、获取 token 的端，未勾选的端一律无法接入。">
      <el-checkbox-group v-model="selectedPlatforms" class="pf-picker">
        <el-checkbox
          v-for="item in PLATFORM_LIST"
          :key="item.key"
          :value="item.key"
          class="pf-opt"
        >
          <span class="pf-opt__name">{{ item.label }}</span>
          <span class="pf-opt__desc">{{ item.desc }}</span>
        </el-checkbox>
      </el-checkbox-group>
    </FormCard>

    <FormCard v-if="h5.enabled" title="H5 网页" desc="浏览器内发起授权，配置回调地址与 PKCE。">
      <el-form label-width="140px" class="ds-form--wide">
        <el-form-item label="回调地址">
          <IdTagsEditor
            v-model="h5.redirectUris"
            placeholder="输入回调 URL 后按回车"
            hint="授权成功后允许跳转的完整地址，建议逐条登记，不要使用通配符。"
          />
        </el-form-item>
        <el-form-item label="启用 PKCE">
          <el-switch v-model="h5.enablePKCE" />
          <p class="ds-hint" style="margin-top: var(--ds-space-2)">纯前端应用建议开启，避免暴露应用密钥。</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving === 'h5'" @click="save('h5')">保存 H5 配置</el-button>
      </template>
    </FormCard>

    <FormCard v-if="desktop.enabled" title="桌面端" desc="桌面客户端通过自定义协议或本地授权页完成回调。">
      <el-form label-width="140px" class="ds-form--wide">
        <el-form-item label="自定义协议">
          <el-input v-model="desktop.customScheme" placeholder="例如 beaver://oauth/callback" />
        </el-form-item>
        <el-form-item label="授权页地址">
          <el-input v-model="desktop.authPageUrl" placeholder="可选，客户端展示的授权页 URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving === 'desktop'" @click="save('desktop')">保存桌面端配置</el-button>
      </template>
    </FormCard>

    <FormCard v-if="mobile.enabled" title="移动端" desc="iOS / Android 应用标识与 Universal Link，用于回调校验。">
      <el-form label-width="140px" class="ds-form--wide">
        <el-form-item label="iOS Bundle ID">
          <el-input v-model="mobile.iosBundleId" placeholder="例如 com.example.app" />
        </el-form-item>
        <el-form-item label="Android 包名">
          <el-input v-model="mobile.androidPackageName" placeholder="例如 com.example.app" />
        </el-form-item>
        <el-form-item label="Universal Link">
          <el-input v-model="mobile.universalLink" placeholder="https://…" />
        </el-form-item>
        <el-form-item label="自定义协议">
          <el-input v-model="mobile.customScheme" placeholder="例如 beaver://oauth/callback" />
        </el-form-item>
        <el-form-item label="启用 PKCE">
          <el-switch v-model="mobile.enablePKCE" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving === 'mobile'" @click="save('mobile')">保存移动端配置</el-button>
      </template>
    </FormCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { getOAuthConfigApi, updateOAuthConfigApi } from "@/api/oauth"
import type { IDesktopOAuthConfig, IH5OAuthConfig, IMobileOAuthConfig } from "@/types/api/oauth"
import FormCard from "@/pages/digitals/components/FormCard.vue"
import IdTagsEditor from "@/pages/digitals/components/IdTagsEditor.vue"

const props = defineProps<{ oauthId: string }>()

type Platform = "h5" | "desktop" | "mobile"

const PLATFORM_LIST: { key: Platform; label: string; desc: string }[] = [
  { key: "h5", label: "H5 网页", desc: "浏览器内跳转授权，支持 PKCE。" },
  { key: "desktop", label: "桌面端", desc: "客户端自定义协议或本地授权页。" },
  { key: "mobile", label: "移动端", desc: "iOS / Android 与 Universal Link。" }
]

const loading = ref(false)
const saving = ref<"" | Platform>("")

const h5 = reactive<IH5OAuthConfig>({ enabled: false, redirectUris: [], enablePKCE: false })
const desktop = reactive<IDesktopOAuthConfig>({ enabled: false, customScheme: "", authPageUrl: "" })
const mobile = reactive<IMobileOAuthConfig>({
  enabled: false,
  iosBundleId: "",
  androidPackageName: "",
  universalLink: "",
  customScheme: "",
  enablePKCE: false
})

const states: Record<Platform, IH5OAuthConfig | IDesktopOAuthConfig | IMobileOAuthConfig> = {
  h5,
  desktop,
  mobile
}

/** 勾选框即各端的 enabled：勾上出现配置卡，取消立刻落库关闭。 */
const selectedPlatforms = computed<string[]>({
  get: () => PLATFORM_LIST.filter(item => states[item.key].enabled).map(item => item.key),
  set: keys => {
    const next = new Set(keys)
    PLATFORM_LIST.forEach(item => {
      const on = next.has(item.key)
      if (states[item.key].enabled === on) return
      states[item.key].enabled = on
      void persist(item.key, on ? `${item.label}接入已开启` : `${item.label}接入已关闭`, true)
    })
  }
})

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

function parseConfig<T>(raw: unknown, fallback: T): T {
  let value: unknown = raw
  if (typeof raw === "string") {
    if (!raw.trim()) return fallback
    try {
      value = JSON.parse(raw)
    } catch {
      return fallback
    }
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback
  return { ...fallback, ...(value as Record<string, unknown>) } as T
}

function loadPayload(type: Platform): unknown {
  if (type === "h5") {
    return { enabled: h5.enabled, redirectUris: [...h5.redirectUris], enablePKCE: h5.enablePKCE }
  }
  if (type === "desktop") {
    return {
      enabled: desktop.enabled,
      customScheme: desktop.customScheme.trim(),
      authPageUrl: desktop.authPageUrl.trim()
    }
  }
  return {
    enabled: mobile.enabled,
    iosBundleId: mobile.iosBundleId.trim(),
    androidPackageName: mobile.androidPackageName.trim(),
    universalLink: mobile.universalLink.trim(),
    customScheme: mobile.customScheme.trim(),
    enablePKCE: mobile.enablePKCE
  }
}

async function persist(type: Platform, successText: string, revertOnFail = false) {
  saving.value = type
  try {
    const res = await updateOAuthConfigApi({
      oauthId: props.oauthId,
      oauthType: type,
      config: JSON.stringify(loadPayload(type))
    })
    if (res.code !== 0) throw new Error(res.msg || "保存失败")
    ElMessage.success(successText)
  } catch (err) {
    if (revertOnFail) states[type].enabled = !states[type].enabled
    ElMessage.error(errorMessage(err, "保存失败"))
  } finally {
    saving.value = ""
  }
}

async function load() {
  loading.value = true
  try {
    const res = await getOAuthConfigApi({ oauthId: props.oauthId })
    const cfg = res?.result
    Object.assign(h5, parseConfig<IH5OAuthConfig>(cfg?.h5Config, {
      enabled: false, redirectUris: [], enablePKCE: false
    }))
    Object.assign(desktop, parseConfig<IDesktopOAuthConfig>(cfg?.desktopConfig, {
      enabled: false, customScheme: "", authPageUrl: ""
    }))
    Object.assign(mobile, parseConfig<IMobileOAuthConfig>(cfg?.mobileConfig, {
      enabled: false, iosBundleId: "", androidPackageName: "",
      universalLink: "", customScheme: "", enablePKCE: false
    }))
    // 服务端可能返回 null，统一收敛成数组，避免 tag 编辑器拿到非数组
    if (!Array.isArray(h5.redirectUris)) h5.redirectUris = []
  } catch {
    ElMessage.error("加载端配置失败")
  } finally {
    loading.value = false
  }
}

async function save(type: Platform) {
  if (type === "h5" && h5.redirectUris.length === 0) {
    ElMessage.warning("请先添加至少一条回调地址")
    return
  }
  const label = PLATFORM_LIST.find(item => item.key === type)?.label || ""
  await persist(type, `${label}配置已保存`)
}

onMounted(load)
</script>

<style lang="less" scoped>
.pf-picker {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ds-space-3);
  width: 100%;
}

.pf-opt {
  height: auto;
  align-items: flex-start;
  margin: 0;
  padding: var(--ds-space-3) var(--ds-space-4);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  background: var(--ds-neutral-0);
  transition: border-color 0.15s, background 0.15s;

  &:hover { border-color: var(--ds-brand-200); }

  &.is-checked {
    border-color: var(--ds-brand);
    background: var(--ds-brand-50);
  }

  :deep(.el-checkbox__input) { margin-top: 3px; }

  :deep(.el-checkbox__label) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    line-height: var(--ds-lh-body);
    white-space: normal;
  }
}

.pf-opt__name {
  font-size: var(--ds-fs-14);
  color: var(--ds-neutral-900);
}

.pf-opt__desc {
  font-size: var(--ds-fs-13);
  color: var(--ds-neutral-600);
}

@media (max-width: 900px) {
  .pf-picker { grid-template-columns: 1fr; }
}
</style>
