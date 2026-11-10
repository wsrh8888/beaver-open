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
  <FormCard
    title="可申请的权限范围"
    desc="勾选该应用可在授权时申请的范围。必需项由平台强制开启，不可取消。"
  >
    <div v-loading="loading">
      <p v-if="!loading && scopes.length === 0" class="ds-hint">暂无可配置范围。</p>

      <el-checkbox-group v-model="selected" class="scope-group">
        <div v-for="item in scopes" :key="item.scope" class="scope-row">
          <el-checkbox :value="item.scope" :disabled="item.required">
            <span class="scope-row__name">{{ item.name }}</span>
            <code class="ds-mono scope-row__code">{{ item.scope }}</code>
          </el-checkbox>
          <span v-if="item.required" class="ds-badge ds-badge--neutral">必需</span>
          <p class="ds-hint">{{ item.description }}</p>
        </div>
      </el-checkbox-group>
    </div>

    <template #footer>
      <el-button type="primary" :loading="saving" @click="save">保存权限范围</el-button>
    </template>
  </FormCard>
</template>

<script lang="ts">
import type { PropType } from "vue"
import { onMounted, ref, defineComponent, toRefs } from "vue"
import { ElMessage } from "element-plus"
import { getOAuthScopesApi, updateOAuthScopesApi } from "@/api/oauth"
import type { IScopeInfo } from "@/types/api/oauth"
import FormCard from "@/pages/oauth/components/FormCard.vue"

export default defineComponent({
  name: "ScopesTab",
  components: { FormCard },
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

    const loading = ref(false)
    const saving = ref(false)
    const scopes = ref<IScopeInfo[]>([])
    const selected = ref<string[]>([])

    const load = async () => {
      loading.value = true
      try {
        const res = await getOAuthScopesApi({ oauthId: props.oauthId })
        scopes.value = res?.result?.scopes ?? []
        selected.value = scopes.value
          .filter(item => item.enabled || item.required)
          .map(item => item.scope)
      } catch {
        ElMessage.error("加载权限范围失败")
      } finally {
        loading.value = false
      }
    }

    const save = async () => {
      saving.value = true
      try {
        // 必需项不可取消，提交时补回去，避免 UI 状态与服务端口径不一致
        const required = scopes.value.filter(item => item.required).map(item => item.scope)
        const merged = Array.from(new Set([...selected.value, ...required]))
        const res = await updateOAuthScopesApi({ oauthId: props.oauthId, scopes: merged })
        if (res.code !== 0) throw new Error(res.msg || "保存失败")
        selected.value = merged
        ElMessage.success("权限范围已保存")
      } catch (err) {
        ElMessage.error(errorMessage(err, "保存失败"))
      } finally {
        saving.value = false
      }
    }

    onMounted(load)
    return {
      ...toRefs(props), props, errorMessage, loading, saving, scopes, selected, load, save,
      onMounted, ref, ElMessage, getOAuthScopesApi, updateOAuthScopesApi, FormCard
    }
  }
})
</script>

<style lang="less" scoped>
.scope-group { display: block; width: 100%; }

.scope-row {
  padding: var(--ds-space-3) 0;
  border-bottom: 1px solid var(--ds-border-light);

  &:last-child { border-bottom: none; }

  .ds-hint { margin-top: var(--ds-space-1); }
}

.scope-row__name {
  font-size: var(--ds-fs-14);
  color: var(--ds-neutral-900);
}

.scope-row__code { margin-left: var(--ds-space-2); }
</style>
