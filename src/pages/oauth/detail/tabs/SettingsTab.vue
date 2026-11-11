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

  设置分区：图标 & 名称 / 描述 / 启用状态。
  OAuth 应用不参与 IM 搜索，所以没有「可见范围」和「已选人员」，这里只放应用自身信息。
-->

<template>
  <FormCard title="基本信息">
    <el-form label-width="88px" class="ds-form" @submit.prevent>
      <el-form-item label="图标 / 名称" required>
        <div class="identity">
          <button
            type="button"
            class="identity__icon"
            title="点击更换图标"
            :disabled="uploadingIcon"
            @click="pickIcon"
          >
            <img v-if="form.icon" :src="form.icon" alt="">
            <template v-else>{{ (form.name || "?").slice(0, 1) }}</template>
            <span class="identity__mask">
              <el-icon v-if="uploadingIcon" class="is-loading"><Loading /></el-icon>
              <el-icon v-else><Camera /></el-icon>
            </span>
          </button>
          <input
            ref="iconInputRef"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            class="identity__file"
            @change="onIconChange"
          >
          <el-input
            v-model="form.name"
            maxlength="50"
            show-word-limit
            placeholder="例如：示例网盘"
            class="identity__name"
          />
        </div>
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="一句话说明应用用途，会显示在授权页"
        />
      </el-form-item>

      <el-form-item label="启用状态">
        <div class="status">
          <el-switch v-model="form.enabled" />
          <span class="status__text">{{ form.enabled ? "启用" : "已停用" }}</span>
        </div>
        <p class="status__hint">停用后所有端都无法再发起授权，已签发的 token 到期即失效。</p>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button type="danger" plain :loading="deleting" @click="removeApp">删除 OAuth 应用</el-button>
      <span class="foot-spacer" />
      <el-button type="primary" :loading="saving" @click="saveAll">保存</el-button>
    </template>
  </FormCard>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Camera, Loading } from "@element-plus/icons-vue"
import { deleteOAuthAppApi, updateOAuthAppApi } from "@/api/oauth"
import { resolveImageUrl, uploadImageFileApi } from "@/api/im"
import type { IOAuthAppInfo } from "@/types/api/oauth"
import FormCard from "@/pages/digitals/components/FormCard.vue"

const props = defineProps<{ app: IOAuthAppInfo }>()
const emit = defineEmits<{ (e: "refresh"): void }>()

const router = useRouter()
const saving = ref(false)
const deleting = ref(false)
const uploadingIcon = ref(false)
const iconInputRef = ref<HTMLInputElement>()

const form = reactive({
  name: props.app.name,
  icon: props.app.icon || "",
  description: props.app.description || "",
  enabled: props.app.status === 1
})

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (err && typeof err === "object" && "msg" in err) {
    return String((err as { msg?: string }).msg || fallback)
  }
  return fallback
}

const MAX_ICON_BYTES = 2 * 1024 * 1024

function pickIcon() {
  if (uploadingIcon.value) return
  iconInputRef.value?.click()
}

async function onIconChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ""
  if (!file) return
  if (!file.type.startsWith("image/")) {
    ElMessage.warning("请选择图片文件")
    return
  }
  if (file.size > MAX_ICON_BYTES) {
    ElMessage.warning("图片不能超过 2MB")
    return
  }
  uploadingIcon.value = true
  try {
    const res = await uploadImageFileApi(file)
    form.icon = resolveImageUrl(res.fileUrl || res.fileKey)
    ElMessage.success("图标已更新，保存后生效")
  } catch (err) {
    ElMessage.error(errorMessage(err, "图标上传失败"))
  } finally {
    uploadingIcon.value = false
  }
}

async function saveAll() {
  const name = form.name.trim()
  if (name.length < 2 || name.length > 50) {
    ElMessage.warning("名称需 2-50 个字符")
    return
  }
  saving.value = true
  try {
    const res = await updateOAuthAppApi({
      oauthId: props.app.oauthId,
      name,
      icon: form.icon.trim(),
      description: form.description.trim(),
      status: form.enabled ? 1 : 0
    })
    if (res.code !== 0) throw new Error(res.msg || "保存失败")
    ElMessage.success("已保存")
    emit("refresh")
  } catch (err) {
    ElMessage.error(errorMessage(err, "保存失败"))
  } finally {
    saving.value = false
  }
}

async function removeApp() {
  try {
    await ElMessageBox.confirm(
      `删除「${props.app.name}」后所有端都无法再发起授权，已签发 token 立即失效。此操作不可撤销，确认删除？`,
      "删除 OAuth 应用",
      { type: "warning", confirmButtonText: "确认删除", cancelButtonText: "取消" }
    )
  } catch {
    return
  }
  deleting.value = true
  try {
    const res = await deleteOAuthAppApi({ oauthId: props.app.oauthId })
    if (res.code !== 0) throw new Error(res.msg || "删除失败")
    ElMessage.success("已删除")
    router.push("/oauth")
  } catch (err) {
    ElMessage.error(errorMessage(err, "删除失败"))
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped lang="less">
.identity {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
  width: 100%;

  &__icon {
    position: relative;
    flex: 0 0 auto;
    width: 52px;
    height: 52px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    border: 1px solid var(--ds-border);
    background: var(--ds-neutral-50);
    font-size: 20px;
    font-weight: var(--ds-weight-bold);
    color: var(--ds-neutral-600);
    overflow: hidden;
    cursor: pointer;

    img { width: 100%; height: 100%; object-fit: cover; }

    &:hover .identity__mask { opacity: 1; }
    &:disabled { cursor: progress; }
  }

  &__mask {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #fff;
    background: rgb(0 0 0 / 45%);
    opacity: 0;
    transition: opacity 0.15s;

    .identity__icon:disabled & { opacity: 1; }
  }

  &__file { display: none; }

  &__name { flex: 1 1 auto; max-width: 320px; }
}

.status {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);

  &__text {
    font-size: var(--ds-fs-13);
    color: var(--ds-neutral-600);
  }

  &__hint {
    width: 100%;
    margin: 6px 0 0;
    font-size: var(--ds-fs-13);
    color: var(--ds-neutral-600);
  }
}

.foot-spacer { flex: 1 1 auto; }

@media (max-width: 767px) {
  .identity { flex-wrap: wrap; }
  .identity__name { max-width: none; flex: 1 1 100%; }
}
</style>
