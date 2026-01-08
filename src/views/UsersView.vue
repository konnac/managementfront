<template>
  <div class="users-container" v-loading="loading" element-loading-text="数据加载中...">
    <h2 class="page-title">用户管理</h2>
    
    <!-- 搜索和操作区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户ID">
          <el-input v-model.number="searchForm.id" placeholder="请输入用户ID" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="ADMIN"></el-option>
            <el-option label="项目经理" value="PROJECT_MANAGER"></el-option>
            <el-option label="普通员工" value="EMPLOYEE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="success" @click="handleAddUser">添加用户</el-button>
        <el-button type="danger" :disabled="selectedUsers.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </el-card>
    
    <!-- 用户列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table :data="usersList" stripe border @selection-change="handleSelectionChange" @row-click="handleViewDetail" style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="用户ID" width="80" align="center">
          <template slot="header">
            <div>用户<br>ID</div>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="150">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleViewDetail(scope.row)" style="font-size: 15px; font-weight: 500;">{{ scope.row.username }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="真实姓名" width="140"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="200"></el-table-column>
        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
        <el-table-column prop="role" label="角色" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)">
              {{ getRoleText(scope.row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button type="primary" size="small" @click.stop="handleEditUser(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click.stop="handleDeleteUser(scope.row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :modal="false"
      append-to-body
    >
      <el-form :model="userForm" :rules="userRules" ref="userForm" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="!!userForm.id"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="修改密码" v-if="userForm.id">
          <el-checkbox v-model="userForm.changePassword">修改密码</el-checkbox>
        </el-form-item>
        <el-form-item label="新密码" prop="password" v-if="userForm.id && userForm.changePassword">
          <el-input v-model="userForm.password" type="password" placeholder="请输入新密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入电话"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="ADMIN"></el-option>
            <el-option label="项目经理" value="PROJECT_MANAGER"></el-option>
            <el-option label="普通员工" value="EMPLOYEE"></el-option>
          </el-select>
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
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveUser">保存</el-button>
      </span>
    </el-dialog>

    <!-- 查看用户详情对话框 -->
    <el-dialog
      title="用户详情"
      :visible.sync="detailDialogVisible"
      width="600px"
      :modal="false"
      append-to-body
    >
      <el-form :model="detailForm" label-width="120px" class="detail-form">
        <el-form-item label="用户ID">
          <el-input v-model="detailForm.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="detailForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="detailForm.realName" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="detailForm.email" disabled></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="detailForm.phone" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色">
          <el-tag :type="getRoleType(detailForm.role)">
            {{ getRoleText(detailForm.role) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-input :value="detailForm.createdTime ? new Date(detailForm.createdTime).toLocaleString() : '-'" disabled></el-input>
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input :value="detailForm.updateTime ? new Date(detailForm.updateTime).toLocaleString() : '-'" disabled></el-input>
        </el-form-item>
        <el-form-item label="头像">
          <img v-if="detailForm.avatar" :src="detailForm.avatar" class="detail-avatar">
          <span v-else>未设置头像</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, addUser, deleteUser, updateUserAdmin, checkUsername } from '../api/users'

export default {
  name: 'UsersView',
  data() {
    const validatePassword = (rule, value, callback) => {
      if (!this.userForm.id && !value) {
        callback(new Error('请输入密码'))
      } else if (this.userForm.id && this.userForm.changePassword && !value) {
        callback(new Error('请输入新密码'))
      } else if (value && value.length < 6) {
        callback(new Error('密码长度不能少于 6 位'))
      } else {
        callback()
      }
    }

    const validateUsername = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
        return
      }
      if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度在 3 到 20 个字符'))
        return
      }
      
      try {
        const response = await checkUsername(value, this.userForm.id)
        if (response.data === false) {
          callback(new Error('用户名已存在'))
        } else {
          callback()
        }
      } catch (error) {
        callback()
      }
    }

    return {
      loading: false,
      searchForm: {
        id: null,
        username: '',
        realName: '',
        role: ''
      },
      usersList: [],
      selectedUsers: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '添加用户',
      userForm: {
        id: null,
        username: '',
        password: '',
        changePassword: false,
        realName: '',
        email: '',
        phone: '',
        role: 'EMPLOYEE',
        avatar: ''
      },
      detailDialogVisible: false,
      detailForm: {
        id: null,
        username: '',
        realName: '',
        email: '',
        phone: '',
        role: '',
        createdTime: '',
        updateTime: '',
        avatar: ''
      },
      userRules: {
        username: [
          { validator: validateUsername, trigger: 'blur' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请选择角色', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    uploadHeaders() {
      const token = localStorage.getItem('token')
      return {
        'Authorization': `Bearer ${token}`
      }
    }
  },
  methods: {
    // 加载用户列表
    async loadUsers() {
      this.loading = true
      try {
        const params = {
          ...this.searchForm,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        
        console.log('Step 1: 发送请求参数:', params)
        const response = await getUsers(params)
        console.log('Step 2: 收到响应:', JSON.stringify(response, null, 2))
        
        if (response.data) {
          console.log('Step 2.5: response.data:', JSON.stringify(response.data, null, 2))
          if (response.data.rows && response.data.rows.length > 0) {
            console.log('Step 2.75: 第一个用户完整数据:', JSON.stringify(response.data.rows[0], null, 2))
          }
        }
        
        this.usersList = response.data && response.data.rows ? response.data.rows : []
        this.pagination.total = response.data && response.data.total ? response.data.total : 0
        
        console.log('Step 3: 设置的usersList:', this.usersList)
        console.log('Step 4: 设置的total:', this.pagination.total)
      } catch (error) {
        console.error('Step 5: 请求失败:', error)
        this.$message.error('加载用户列表失败，请稍后重试')
        this.usersList = []
        this.pagination.total = 0
      } finally {
        this.loading = false
      }
    },
    // 搜索
    handleSearch() {
      this.pagination.page = 1
      this.loadUsers()
    },
    // 重置搜索
    handleReset() {
      this.searchForm = {
        id: null,
        username: '',
        realName: '',
        role: ''
      }
      this.pagination.page = 1
      this.loadUsers()
    },
    // 分页大小改变
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.page = 1
      this.loadUsers()
    },
    // 当前页码改变
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadUsers()
    },
    // 选择用户
    handleSelectionChange(selection) {
      this.selectedUsers = selection
    },
    // 查看用户详情
    handleViewDetail(row) {
      this.detailForm = {
        id: row.id,
        username: row.username,
        realName: row.realName,
        email: row.email,
        phone: row.phone,
        role: row.role,
        createdTime: row.createdTime,
        updateTime: row.updateTime,
        avatar: row.avatar
      }
      this.detailDialogVisible = true
    },
    // 添加用户
    handleAddUser() {
      this.dialogTitle = '添加用户'
      this.userForm = {
        id: null,
        username: '',
        password: '',
        changePassword: false,
        realName: '',
        email: '',
        phone: '',
        role: 'EMPLOYEE',
        avatar: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    // 编辑用户
    handleEditUser(user) {
      this.dialogTitle = '编辑用户'
      this.userForm = {
        ...user,
        changePassword: false,
        password: ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.clearValidate()
      })
    },
    // 保存用户
    async handleSaveUser() {
      this.$refs.userForm.validate(async (valid) => {
        if (valid) {
          try {
            const userData = { ...this.userForm }
            
            if (this.userForm.id) {
              if (!this.userForm.changePassword) {
                delete userData.password
              }
              delete userData.changePassword
              await updateUserAdmin(userData)
              this.$message.success('用户更新成功')
            } else {
              delete userData.changePassword
              await addUser(userData)
              this.$message.success('用户添加成功')
            }
            this.dialogVisible = false
            this.loadUsers()
          } catch (error) {
            this.$message.error('操作失败')
            console.error(error)
          }
        }
      })
    },
    // 删除用户
    async handleDeleteUser(id) {
      this.$confirm('确定要删除该用户吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteUser([id])
          this.$message.success('用户删除成功')
          this.loadUsers()
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    // 批量删除用户
    async handleBatchDelete() {
      if (this.selectedUsers.length === 0) {
        this.$message.warning('请选择要删除的用户')
        return
      }
      
      this.$confirm('确定要批量删除选中的用户吗？', '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedUsers.map(user => user.id)
          await deleteUser(ids)
          this.$message.success('批量删除成功')
          this.selectedUsers = []
          this.loadUsers()
        } catch (error) {
          this.$message.error('批量删除失败')
          console.error(error)
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    // 获取角色类型
    getRoleType(role) {
      const types = {
        ADMIN: 'danger',
        PROJECT_MANAGER: 'warning',
        EMPLOYEE: 'success'
      }
      return types[role] || 'info'
    },
    // 获取角色文本
    getRoleText(role) {
      const texts = {
        ADMIN: '管理员',
        PROJECT_MANAGER: '项目经理',
        EMPLOYEE: '普通员工'
      }
      return texts[role] || role
    },
    // 头像上传成功
    handleAvatarSuccess(response) {
      if (response.code === 200) {
        this.userForm.avatar = response.data.url
        this.$message.success('头像上传成功')
      } else {
        this.$message.error(response.msg || '头像上传失败')
      }
    },
    // 头像上传前校验
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
  },
  mounted() {
    this.loadUsers()
  }
}
</script>

<style scoped>
.users-container {
  padding: 0;
  width: 100%;
  margin: 0 auto;
  background: #f8fafc;
  min-height: calc(100vh - 120px);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 24px 24px 24px 24px;
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

.search-card {
  margin: 0 24px 20px 24px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.search-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.search-form {
  margin-bottom: 0;
}

.search-form .el-form-item {
  margin-bottom: 16px;
}

.search-form .el-input__inner,
.search-form .el-select .el-input__inner {
  border-radius: 8px;
  border-color: #e2e8f0;
  transition: all 0.3s ease;
}

.search-form .el-input__inner:focus,
.search-form .el-select .el-input__inner:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  margin-top: 16px;
}

.action-buttons .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-buttons .el-button--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
}

.action-buttons .el-button--success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.action-buttons .el-button--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
}

.action-buttons .el-button--danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.table-card {
  margin: 0 24px 20px 24px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.table-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.el-table {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  padding: 12px 0;
}

.el-table td {
  padding: 12px 0;
}

.el-table--border th,
.el-table--border td {
  border-color: #e2e8f0;
}

.el-table--enable-row-hover .el-table__body tr:hover > td {
  background-color: #f8fafc;
}

.el-table .el-button--small {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-table .el-button--small:hover {
  transform: translateY(-1px);
}

.el-pagination {
  font-weight: 500;
}

.el-pagination button,
.el-pagination span:not([class*="suffix"]) {
  color: #64748b;
}

.el-pagination .el-pager li {
  border-radius: 6px;
  margin: 0 4px;
  transition: all 0.3s ease;
}

.el-pagination .el-pager li:hover {
  color: #4f46e5;
}

.el-pagination .el-pager li.active {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.el-pagination .btn-prev,
.el-pagination .btn-next {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.el-pagination .btn-prev:hover,
.el-pagination .btn-next:hover {
  color: #4f46e5;
}

.el-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 4px 12px;
}

.avatar-uploader {
  text-align: left;
}

.avatar-uploader .el-upload {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.avatar-uploader .el-upload:hover {
  border-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}

.avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
  border-radius: 8px;
}

.detail-avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.detail-form .el-input__inner {
  background-color: #f5f7fa;
  color: #606266;
}
</style>