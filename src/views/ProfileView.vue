<template>
  <div class="profile-container">
    <h2 class="page-title">个人中心</h2>
    
    <el-row :gutter="24">
      <el-col :span="8">
        <el-card class="profile-card" shadow="hover">
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <img v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar">
              <div v-else class="avatar-placeholder">
                <i class="el-icon-user"></i>
              </div>
              <div class="avatar-overlay">
                <i class="el-icon-camera"></i>
                <span>更换头像</span>
              </div>
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleUpload"
              >
              </el-upload>
            </div>
          </div>
          <div class="user-name">{{ userInfo.realName }}</div>
          <div class="user-role">{{ getRoleText(userInfo.role) }}</div>
          <el-divider></el-divider>
          <div class="info-item">
            <i class="el-icon-user"></i>
            <span>用户名: {{ userInfo.username }}</span>
          </div>
          <div class="info-item">
            <i class="el-icon-message"></i>
            <span>邮箱: {{ userInfo.email }}</span>
          </div>
          <div class="info-item">
            <i class="el-icon-phone"></i>
            <span>电话: {{ userInfo.phone }}</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="16">
        <el-card class="edit-card" shadow="hover">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="基本信息" name="basic">
              <el-form :model="basicForm" :rules="basicRules" ref="basicForm" label-width="100px">
                <el-form-item label="用户名">
                  <el-input v-model="basicForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="真实姓名">
                  <el-input v-model="basicForm.realName" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="basicForm.email" placeholder="请输入邮箱"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="phone">
                  <el-input v-model="basicForm.phone" placeholder="请输入电话"></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdateBasic">保存基本信息</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            
            <el-tab-pane label="修改密码" name="password">
              <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password></el-input>
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password></el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleUpdatePassword">修改密码</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <AvatarCropper
      :visible.sync="cropperVisible"
      :image-url="imageUrl"
      @crop="handleCrop"
    />
  </div>
</template>

<script>
import { updateUser, changePassword } from '../api/users'
import AvatarCropper from '../components/AvatarCropper.vue'

export default {
  name: 'ProfileView',
  components: {
    AvatarCropper
  },
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    return {
      activeTab: 'basic',
      cropperVisible: false,
      imageUrl: '',
      basicForm: {
        id: null,
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: '',
        avatar: ''
      },
      basicRules: {
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo || {}
    }
  },
  mounted() {
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      this.basicForm = { ...this.userInfo }
    },
    getRoleText(role) {
      const texts = {
        ADMIN: '管理员',
        PROJECT_MANAGER: '项目经理',
        EMPLOYEE: '普通员工'
      }
      return texts[role] || role
    },
    handleUpdateBasic() {
      this.$refs.basicForm.validate(async (valid) => {
        if (valid) {
          try {
            await updateUser(this.basicForm)
            this.$store.commit('user/SET_USER_INFO', { ...this.basicForm })
            this.$message.success('基本信息更新成功')
          } catch (error) {
            this.$message.error('更新失败')
            console.error(error)
          }
        }
      })
    },
    handleUpdatePassword() {
      this.$refs.passwordForm.validate(async (valid) => {
        if (valid) {
          try {
            const data = {
              id: this.userInfo.id,
              oldPassword: this.passwordForm.oldPassword,
              password: this.passwordForm.newPassword
            }
            await changePassword(data)
            this.$message.success('密码修改成功，请重新登录')
            this.$refs.passwordForm.resetFields()
            setTimeout(() => {
              this.$store.dispatch('user/logout')
              this.$router.push('/login')
            }, 1500)
          } catch (error) {
            this.$message.error('密码修改失败，请检查原密码是否正确')
            console.error(error)
          }
        }
      })
    },
    handleAvatarSuccess(response) {
      if (response.code === 200) {
        this.basicForm.avatar = response.data.url
        this.updateAvatar()
        this.$message.success('头像上传成功')
      } else {
        this.$message.error(response.msg || '头像上传失败')
      }
    },
    handleUpload(options) {
      const file = options.file
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imageUrl = e.target.result
        this.cropperVisible = true
      }
      reader.readAsDataURL(file)
    },
    async handleCrop(file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        console.log('开始上传头像文件:', file.name, file.size, file.type)
        
        const response = await this.$axios.post('/upload', formData)
        
        console.log('上传响应:', response)
        
        if (response.code === 200) {
          this.basicForm.avatar = response.data.url
          await this.updateAvatar()
          this.$message.success('头像更新成功')
        } else {
          this.$message.error(response.msg || '头像上传失败')
        }
      } catch (error) {
        console.error('头像上传错误:', error)
        
        let errorMessage = '头像上传失败'
        
        if (error.response) {
          console.error('错误响应:', error.response)
          console.error('错误响应数据:', error.response.data)
          
          if (error.response.data && error.response.data.msg) {
            errorMessage = error.response.data.msg
          } else if (error.response.status) {
            errorMessage = `上传失败 (${error.response.status})`
          }
        } else if (error.message) {
          errorMessage = `上传失败: ${error.message}`
        }
        
        this.$message.error(errorMessage)
      }
    },
    async updateAvatar() {
      try {
        await updateUser(this.basicForm)
        this.$store.commit('user/SET_USER_INFO', { ...this.basicForm })
      } catch (error) {
        this.$message.error('头像更新失败')
        console.error(error)
      }
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2
      
      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG/PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 24px;
  background: #f8fafc;
  min-height: calc(100vh - 120px);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title::before {
  content: '';
  width: 4px;
  height: 28px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 2px;
}

.profile-card {
  height: fit-content;
  text-align: center;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.avatar-section {
  padding: 30px 0;
}

.avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder i {
  font-size: 40px;
  color: #94a3b8;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay i {
  font-size: 24px;
  color: #fff;
  margin-bottom: 4px;
}

.avatar-overlay span {
  font-size: 12px;
  color: #fff;
}

.avatar-uploader {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.avatar-uploader ::v-deep .el-upload {
  width: 100%;
  height: 100%;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-top: 12px;
}

.user-role {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 0;
  color: #475569;
  font-size: 14px;
}

.info-item i {
  margin-right: 8px;
  color: #4f46e5;
  font-size: 16px;
}

.edit-card {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.edit-card ::v-deep .el-tabs__content {
  padding: 24px;
}

.edit-card ::v-deep .el-form-item {
  margin-bottom: 24px;
}

.edit-card ::v-deep .el-input__inner {
  border-radius: 8px;
  border-color: #e2e8f0;
  transition: all 0.3s ease;
}

.edit-card ::v-deep .el-input__inner:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.edit-card ::v-deep .el-button--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-card ::v-deep .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
</style>
