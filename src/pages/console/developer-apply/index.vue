<template>
  <div class="developer-apply-page">
    <el-card>
      <template #header>
        <span>开发者申请</span>
      </template>

      <el-alert
        title="申请说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <p>1. 申请成为开发者后，您可以创建和管理应用</p>
        <p>2. 审核通过后，您将能够使用开放平台的所有功能</p>
        <p>3. 请如实填写信息，审核将在 1-3 个工作日内完成</p>
      </el-alert>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 600px"
      >
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="公司名称" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输入公司名称（可选）" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>

        <el-form-item label="联系邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入联系邮箱" />
        </el-form-item>

        <el-form-item label="应用场景描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="5"
            placeholder="请详细描述您的应用场景和用途"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            提交申请
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { applyDeveloperApi, type IApplyDeveloperReq } from '@/api/open'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive<IApplyDeveloperReq>({
  realName: '',
  companyName: '',
  phone: '',
  email: '',
  description: ''
})

const rules: FormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入联系邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入应用场景描述', trigger: 'blur' },
    { min: 10, message: '描述至少需要 10 个字符', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const res = await applyDeveloperApi(form)
        if (res.success) {
          ElMessage.success('申请提交成功，请耐心等待审核')
          // 跳转到控制台首页
          router.push('/console/dashboard')
        } else {
          ElMessage.error(res.message || '申请失败')
        }
      } catch (error) {
        console.error('申请失败:', error)
        ElMessage.error('申请失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleReset = () => {
  formRef.value?.resetFields()
}
</script>

<style scoped lang="less">
.developer-apply-page {
  padding: 20px;
}
</style>
