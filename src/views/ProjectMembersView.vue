<template>
  <div class="project-members-container">
    <h2 class="page-title">项目成员管理</h2>
    
    <!-- 项目信息 -->
    <el-card class="project-info-card" shadow="hover">
      <div class="project-info">
        <div class="project-header">
          <h3>{{ projectInfo.name }}</h3>
          <div class="project-actions">
            <el-button type="primary" size="small" @click="handleViewTasks">查看任务</el-button>
            <el-button type="info" size="small" @click="handleViewDocuments">查看文档</el-button>
          </div>
        </div>
        <p class="project-description">{{ projectInfo.description }}</p>
        <div class="project-meta">
          <span class="meta-item">
            <i class="el-icon-user"></i>
            项目经理：{{ projectInfo.managerName }}
          </span>
          <span class="meta-item">
            <i class="el-icon-time"></i>
            开始日期：{{ projectInfo.startDate }}
          </span>
          <span class="meta-item">
            <i class="el-icon-time"></i>
            (预计)结束日期：
            <el-tooltip content="项目创建时设定的预期完成日期" placement="top">
              <span style="border-bottom: 1px dashed #909399; cursor: help;">{{ projectInfo.endDate }}</span>
            </el-tooltip>
          </span>
        </div>
      </div>
    </el-card>
    
    <!-- 成员管理 -->
    <el-card class="members-card" shadow="hover">
      <div class="members-header">
        <h3>项目成员列表</h3>
        <el-button type="primary" @click="showAddMemberDialog" v-if="canManageMembers">添加成员</el-button>
      </div>
      
      <el-table :data="membersList" stripe border style="width: 100%" :cell-style="{padding: '8px 0'}" :header-cell-style="{padding: '8px 0'}">
        <el-table-column prop="userId" label="用户ID" width="90" align="center"></el-table-column>
        <el-table-column prop="realName" label="姓名" width="110" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="140" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="220" show-overflow-tooltip></el-table-column>
        <el-table-column prop="phone" label="电话" width="150" align="center"></el-table-column>
        <el-table-column prop="role" label="角色" width="140" align="center">
          <template slot-scope="scope">
            <el-tag :type="getRoleType(scope.row.role)" style="background-color: #FFF3E0; border-color: #FFE0B2; color: #E65100;">
              {{ getRoleText(scope.row.role, scope.row.customRole) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ scope.row.status === 'ACTIVE' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="380" align="center" v-if="canManageMembers">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button type="primary" size="small" @click="showEditRoleDialog(scope.row)">修改角色</el-button>
              <el-button type="success" size="small" @click="handleActivateMember(scope.row)" v-if="scope.row.status === 'INACTIVE'">激活</el-button>
              <el-button type="danger" size="small" @click="handleRemoveMember(scope.row)">移除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页控件 -->
      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        ></el-pagination>
      </div>
    </el-card>
    
    <!-- 添加成员对话框 -->
    <project-member-form-modal
      :visible.sync="addMemberDialogVisible"
      title="添加项目成员"
      :member="addMemberForm"
      :available-users="availableUsers"
      @confirm="handleAddMember"
    ></project-member-form-modal>
    
    <!-- 修改角色对话框 -->
    <project-member-form-modal
      :visible.sync="editRoleDialogVisible"
      title="修改成员角色"
      :member="editRoleForm"
      :available-users="availableUsers"
      @confirm="handleUpdateRole"
    ></project-member-form-modal>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { getProjects, getProjectMembers, addProjectMember, updateProjectMemberRole, removeProjectMember, activateProjectMember } from '../api/projects'
import { getAvailableUsers } from '../api/users'
import { mapGetters } from 'vuex'
import ProjectMemberFormModal from '../components/ProjectMemberFormModal.vue'

export default {
  name: 'ProjectMembersView',
  components: {
    ProjectMemberFormModal
  },
  data() {
    return {
      projectId: null,
      projectInfo: {
        name: '',
        description: '',
        managerName: '',
        startDate: '',
        endDate: ''
      },
      membersList: [],
      // 分页信息
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      availableUsers: [],
      addMemberDialogVisible: false,
      editRoleDialogVisible: false,
      addMemberForm: {
        userId: null,
        role: 'DEVELOPER',
        customRole: ''
      },
      editRoleForm: {
        id: null,
        role: 'DEVELOPER',
        customRole: ''
      },
      searchForm: {
        realName: '',
        username: '',
        role: ''
      }
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    canManageMembers() {
      if (!this.userInfo) return false
      if (this.userInfo.role === 'ADMIN') return true
      if (this.userInfo.role === 'PROJECT_MANAGER') return true
      return false
    }
  },
  methods: {
    // 获取角色类型
    getRoleType(role) {
      const types = {
        CUSTOM: 'warning',
        PROJECT_MANAGER: 'danger',
        DEVELOPER: 'success',
        TESTER: 'info',
        PRODUCT_MANAGER: 'primary',
        DESIGNER: 'primary',
        DOCUMENT_WRITER: 'info',
        ANALYST: 'warning',
        OBSERVER: 'info'
      }
      return types[role] || 'info'
    },
    // 获取角色文本
    getRoleText(role, customRole = '') {
      if (role === 'CUSTOM' && customRole) {
        return customRole
      }
      const texts = {
        CUSTOM: '自定义',
        PROJECT_MANAGER: '项目经理',
        DEVELOPER: '开发人员',
        TESTER: '测试人员',
        PRODUCT_MANAGER: '产品经理',
        DESIGNER: '设计师',
        DOCUMENT_WRITER: '文档专员',
        ANALYST: '分析师',
        OBSERVER: '观察者'
      }
      return texts[role] || role
    },
    // 获取项目信息
    async loadProjectInfo() {
      try {
        const response = await getProjects({ id: this.projectId, currentUserId: 1 })
        console.log('后端返回的完整项目信息响应：', response)
        if (response.data.rows && response.data.rows.length > 0) {
          const projectData = response.data.rows[0]
          console.log('项目数据：', projectData)
          console.log('项目所有字段：', Object.keys(projectData))
          this.projectInfo = {
            name: projectData.name || projectData.project_name || '',
            description: projectData.description || projectData.project_description || '',
            managerName: projectData.managerName || projectData.manager_name || projectData.manager || projectData.projectManager || projectData.project_manager || '',
            startDate: projectData.startDate || projectData.start_date || projectData.startTime || projectData.start_time || '',
            endDate: projectData.endDate || projectData.end_date || projectData.endTime || projectData.end_time || ''
          }
          console.log('处理后的项目信息：', this.projectInfo)
        }
      } catch (error) {
        this.$message.error('加载项目信息失败')
        console.error(error)
      }
    },
    // 获取项目成员列表
    async loadMembersList() {
      try {
        const params = {
          id: this.projectId,
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }
        
        if (this.searchForm.realName) {
          params.realName = this.searchForm.realName
        }
        if (this.searchForm.username) {
          params.username = this.searchForm.username
        }
        if (this.searchForm.role) {
          params.role = this.searchForm.role
        }
        
        const response = await getProjectMembers(params)
        console.log('后端返回的完整响应：', response)
        console.log('后端返回的成员列表：', response.data.rows)
        
        // 数据转换：确保字段名称与前端表格绑定的字段一致
        this.membersList = response.data.rows.map((member, index) => {
          console.log(`第${index}个成员原始数据：`, member)
          
          // 提取所有可能的字段名，确保不遗漏任何信息
          const allKeys = Object.keys(member)
          console.log(`第${index}个成员的所有字段：`, allKeys)
          
          return {
            id: member.id,
            userId: member.userId || member.user_id || member.pmId || member.pm_id || '未知',
            realName: member.realName || member.real_name || member.name || member.userName || member.user_name || member.displayName || member.display_name || '未知',
            username: member.username || member.user_name || member.loginName || member.login_name || '未知',
            email: member.email || member.emailAddress || member.email_address || '未知',
            phone: member.phone || member.mobile || member.tel || member.telephone || '未知',
            role: member.role || member.projectRole || member.project_role || member.userRole || member.user_role || '未知',
            customRole: member.customRole || member.custom_role || '',
            status: member.status || 'ACTIVE'
          }
        })
        
        console.log('转换后的成员列表：', this.membersList)
        this.pagination.total = response.data.total
        
        // 从成员列表中查找项目经理
        const manager = this.membersList.find(member => {
          const roleText = this.getRoleText(member.role, member.customRole)
          return roleText === '项目经理' || member.role === 'PROJECT_MANAGER' || member.role === 'PM' || member.role === 'MANAGER'
        })
        if (manager) {
          this.projectInfo.managerName = manager.realName
          console.log('找到项目经理：', manager.realName)
        }
      } catch (error) {
        this.$message.error('加载项目成员列表失败')
        console.error(error)
        // 如果API调用失败，使用模拟数据作为备选
        this.membersList = [
          { id: 1, realName: '张三', username: 'zhangsan', email: 'zhangsan@example.com', phone: '13800138001', role: 'ADMIN' },
          { id: 2, realName: '李四', username: 'lisi', email: 'lisi@example.com', phone: '13800138002', role: 'MEMBER' },
          { id: 3, realName: '王五', username: 'wangwu', email: 'wangwu@example.com', phone: '13800138003', role: 'VIEWER' }
        ]
        this.pagination.total = this.membersList.length
      }
    },
    // 获取可选用户列表
    async loadAvailableUsers() {
      try {
        const response = await getAvailableUsers()
        const allUsers = response.data
        
        const memberUserIds = this.membersList.map(member => member.userId || member.id)
        this.availableUsers = allUsers.filter(user => !memberUserIds.includes(user.id))
      } catch (error) {
        this.$message.error('加载用户列表失败')
        console.error(error)
      }
    },
    // 显示添加成员对话框
    async showAddMemberDialog() {
      await this.loadAvailableUsers()
      this.addMemberForm = {
        userId: null,
        role: 'DEVELOPER',
        customRole: ''
      }
      this.addMemberDialogVisible = true
    },
    // 显示修改角色对话框
    showEditRoleDialog(member) {
      this.editRoleForm = {
        id: member.id,
        role: member.role,
        customRole: member.customRole || ''
      }
      this.editRoleDialogVisible = true
    },
    // 添加成员
    async handleAddMember(formData) {
      if (formData.role === 'CUSTOM' && !formData.customRole) {
        this.$message.warning('请输入自定义角色名称')
        return
      }
      try {
        const memberData = {
          projectId: this.projectId,
          userId: formData.userId,
          projectRole: formData.role,
          customRole: formData.customRole,
          joinBy: 1
        }
        await addProjectMember(memberData, 1)
        this.$message.success('成员添加成功')
        this.addMemberDialogVisible = false
        await this.loadMembersList()
        await this.loadAvailableUsers()
      } catch (error) {
        this.$message.error('添加成员失败')
        console.error(error)
      }
    },
    // 更新角色
    async handleUpdateRole(formData) {
      if (formData.role === 'CUSTOM' && !formData.customRole) {
        this.$message.warning('请输入自定义角色名称')
        return
      }
      try {
        const roleData = {
          projectId: this.projectId,
          userId: formData.userId,
          role: formData.role,
          customRole: formData.customRole
        }
        await updateProjectMemberRole(roleData)
        this.$message.success('角色更新成功')
        this.editRoleDialogVisible = false
        this.loadMembersList()
      } catch (error) {
        this.$message.error('更新角色失败')
        console.error(error)
      }
    },
    // 移除成员
    handleRemoveMember(member) {
      console.log('移除成员:', member) // 使用member参数
      this.$confirm('确定要将该成员移出项目吗？', '移除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await removeProjectMember(this.projectId, member.id, 1) // 1为临时operatorId
          this.$message.success('成员移出成功')
          await this.loadMembersList()
          await this.loadAvailableUsers()
        } catch (error) {
          this.$message.error('移出成员失败')
          console.error(error)
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    // 激活成员
    async handleActivateMember(member) {
      try {
        await activateProjectMember(this.projectId, member.userId)
        this.$message.success('成员激活成功')
        await this.loadMembersList()
      } catch (error) {
        this.$message.error('激活成员失败')
        console.error(error)
      }
    },
    // 分页事件处理：当前页变化
    handleCurrentChange(currentPage) {
      this.pagination.currentPage = currentPage
      this.loadMembersList()
    },
    // 分页事件处理：每页大小变化
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.currentPage = 1 // 重置为第一页
      this.loadMembersList()
    },
    // 搜索成员
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadMembersList()
    },
    // 重置搜索条件
    handleReset() {
      this.searchForm = {
        realName: '',
        username: '',
        role: ''
      }
      this.pagination.currentPage = 1
      this.loadMembersList()
    },
    // 查看项目任务
    handleViewTasks() {
      this.$router.push({ name: 'projectTasks', params: { id: this.projectId } })
    },
    // 查看项目文档
    handleViewDocuments() {
      this.$router.push({ 
        name: 'projectDocuments', 
        params: { id: this.projectId },
        query: { projectName: this.projectInfo.name }
      })
    }
  },
  watch: {
    '$route'(to, from) {
      if (to.params.id !== from.params.id) {
        this.projectId = to.params.id
        this.loading = true
        if (this.projectId) {
          Promise.all([
            this.loadProjectInfo(),
            this.loadMembersList()
          ]).finally(() => {
            this.loading = false
          })
        } else {
          this.loading = false
          this.$message.error('项目ID不存在')
          this.$router.push('/projects')
        }
      }
    }
  },
  mounted() {
    this.loading = true
    this.projectId = this.$route.params.id
    if (this.projectId) {
      Promise.all([
        this.loadProjectInfo(),
        this.loadMembersList()
      ]).finally(() => {
        this.loading = false
      })
    } else {
      this.loading = false
      this.$message.error('项目ID不存在')
      this.$router.push('/projects')
    }
  }
}
</script>

<style scoped>
.project-members-container {
  padding: 24px;
  width: 100%;
  margin: 0 auto;
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

.project-info-card {
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: none;
}

.project-info {
  padding: 10px 0;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-header h3 {
  margin: 0;
  font-size: 22px;
  color: #1e293b;
  font-weight: 700;
}

.project-actions {
  display: flex;
  gap: 10px;
}

.project-actions .el-button {
  padding: 12px 24px;
  font-size: 15px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.project-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.project-description {
  margin: 0 0 16px 0;
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #64748b;
  font-weight: 500;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
}

.meta-item i {
  margin-right: 8px;
  color: #409EFF;
  font-size: 16px;
}

.members-card {
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  border: none;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.members-header h3 {
  margin: 0;
  font-size: 22px;
  color: #1e293b;
  font-weight: 700;
}

.members-header .el-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.members-header .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-form {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.search-form .el-form-item {
  margin-bottom: 12px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.el-table {
  font-size: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.el-table th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 600;
  padding: 12px 0;
}

.el-table td {
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.el-table tr:hover > td {
  background-color: #f8fafc;
}

.el-table .el-button {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.el-table .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 4px 12px;
}
</style>