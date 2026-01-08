<template>
  <el-dialog
    :title="title"
    :visible="dialogVisible"
    width="500px"
    :modal="true"
    :modal-append-to-body="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" :disabled="!!form.id"></el-input>
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="form.realName" placeholder="请输入真实姓名"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" placeholder="请输入手机号"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
          <el-option label="管理员" value="ADMIN"></el-option>
          <el-option label="项目经理" value="PROJECT_MANAGER"></el-option>
          <el-option label="普通员工" value="EMPLOYEE"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="修改密码" v-if="form.id">
        <el-checkbox v-model="form.changePassword">修改密码</el-checkbox>
      </el-form-item>
      <el-form-item label="密码" prop="password" v-if="!form.id || (form.id && form.changePassword)">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password></el-input>
      </el-form-item>
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          action="/api/upload"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="uploadHeaders"
        >
          <img v-if="form.avatar" :src="form.avatar" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleConfirm">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserFormModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '用户'
    },
    user: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!this.form.id && !value) {
        callback(new Error('请输入密码'))
      } else if (this.form.id && this.form.changePassword && !value) {
        callback(new Error('请输入新密码'))
      } else if (value && value.length < 6) {
        callback(new Error('密码长度不能少于 6 位'))
      } else {
        callback()
      }
    }

    return {
      form: {
        id: null,
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: 'EMPLOYEE',
        password: '',
        changePassword: false,
        avatar: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
          { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    uploadHeaders() {
      const token = localStorage.getItem('token')
      return {
        'Authorization': `Bearer ${token}`
      }
    }
  },
  watch: {
    user: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.form = { ...newVal }
        } else {
          this.resetForm()
        }
      },
      immediate: true,
      deep: true
    },
    visible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate()
        })
      }
    }
  },
  methods: {
    resetForm() {
      this.form = {
        id: null,
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: 'user',
        password: '',
        confirmPassword: ''
      }
    },
    handleClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleConfirm() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const data = { ...this.form }
          delete data.confirmPassword
          this.$emit('confirm', data)
          this.handleClose()
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
