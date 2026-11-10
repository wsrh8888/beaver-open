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
  <div v-loading="loading">
    <div class="ds-notice" style="margin-bottom: var(--ds-space-5)">
      <span>三端配置互相独立，各自保存。服务端按端存储一整份配置，未保存的修改不会影响其它端。</span>
    </div>

    <FormCard title="H5 网页" desc="浏览器内发起授权，配置回调地址与 PKCE。">
      <el-form label-width="140px" class="ds-form--wide">
        <el-form-item label="启用 H5 接入">
          <el-switch v-model="h5.enabled" />
        </el-form-item>
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
        <el-button type="primary" :loading="saving === 'h5'" @click="saveH5">保存 H5 配置</el-button>
      </template>
    </FormCard>

    <FormCard title="桌面端" desc="桌面客户端通过自定义协议或本地授权页完成回调。">
      <el-form label-width="140px" class="ds-form--wide">
        <el-form-item label="启用桌面端">
          <el-switch v-model="desktop.enabled" />
        </el-form-item>
        <el-form-item label="自定义协议">
          <el-input v-model="desktop.customScheme" placeholder="例如 beaver://oauth/callback" />
        </el-form-item>
        <el-form-item label="授权页地址">
          <el-input v-model="desktop.authPageUrl" placeholder="可选，客户端展示的授权页 URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="saving === 'desktop'" @click="saveDesktop">保存桌面端配置</el-button>
      </template>
    </FormCard>

    <FormCard title="移动端" desc="iOS / Android 应用标识与 Universal Link，用于回调校验。">
      <el-form label-width="140px" class="ds-form--wide">
        <el-form-item label="启用移动端">
          <el-switch v-model="mobile.enabled" />
        </el-form-item>
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
        <el-button type="primary" :loading="saving === 'mobile'" @click="saveMobile">保存移动端配置</el-button>
      </template>
    </FormCard>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { onMounted, reactive, ref, defineComponent, toRefs } from "vue"
import { ElMessage } from "element-plus"
import { getOAuthConfigApi, updateOAuthConfigApi } from "@/api/oauth"
import type { IDesktopOAuthConfig, IH5OAuthConfig, IMobileOAuthConfig } from "@/types/api/oauth"
import FormCard from "@/pages/oauth/components/FormCard.vue"
import IdTagsEditor from "@/pages/oauth/components/IdTagsEditor.vue"

type Platform = "h5" | "desktop" | "mobile"

export default defineComponent({
  name: "PlatformsTab",
  props: {
    oauthId: { type: String, required: true }
  },
  setup(props) {
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

    function stringifyConfig(value: unknown): string {
      return JSON.stringify(value ?? {})
    }

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

    const load = async () => {
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

    const save = async (type: Platform, payload: unknown) => {
      saving.value = type
      try {
        const res = await updateOAuthConfigApi({
          oauthId: props.oauthId,
          oauthType: type,
          config: stringifyConfig(payload)
        })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        ElMessage.success("已保存")
      } catch (err) {
        ElMessage.error(errorMessage(err, "保存失败"))
      } finally {
        saving.value = ""
      }
    }

    const saveH5 = () => save("h5", {
      enabled: h5.enabled,
      redirectUris: h5.redirectUris,
      enablePKCE: h5.enablePKCE
    })
    const saveDesktop = () => save("desktop", {
      enabled: desktop.enabled,
      customScheme: desktop.customScheme.trim(),
      authPageUrl: desktop.authPageUrl.trim()
    })
    const saveMobile = () => save("mobile", {
      enabled: mobile.enabled,
      iosBundleId: mobile.iosBundleId.trim(),
      androidPackageName: mobile.androidPackageName.trim(),
      universalLink: mobile.universalLink.trim(),
      customScheme: mobile.customScheme.trim(),
      enablePKCE: mobile.enablePKCE
    })

    onMounted(load)
    return {
      ...toRefs(props), props, errorMessage, parseConfig, stringifyConfig, loading, saving,
      h5, desktop, mobile, load, save, saveH5, saveDesktop, saveMobile, onMounted, reactive,
      ref, ElMessage, getOAuthConfigApi, updateOAuthConfigApi, FormCard, IdTagsEditor
    }
  }
})
</script>
