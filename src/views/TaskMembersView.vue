<template>
  <div class="task-members-container" v-loading="loading" element-loading-text="数据加载中...">
    <h2 class="page-title">任务成员管理</h2>
    
    <!-- 任务信息 -->
    <el-card class="task-info-card" shadow="hover">
      <div class="task-info">
        <h3>{{ taskInfo.title }}</h3>
        <p class="task-description">{{ taskInfo.description }}</p>
        <div class="task-meta">
          <span class="meta-item">
            <i class="el-icon-user"></i>
            负责人：{{ taskInfo.assigneeName }}
          </span>
          <span class="meta-item">
            <i class="el-icon-date"></i>
            截止日期：{{ taskInfo.deadline }}
          </span>
          <span class="meta-item">
            <el-tag :type="getStatusType(taskInfo.status)" size="small">
              {{ getStatusText(taskInfo.status) }}
            </el-tag>
          </span>
        </div>
      </div>
    </el-card>
    
    <!-- 成员管理 -->
    <el-card class="members-card" shadow="hover">
      <div class="members-header">
        <h3>任务成员列表</h3>
        <div class="header-actions">
          <el-button type="success" @click="showAddMemberDialog" v-if="canManageMembers">添加成员</el-button>
        </div>
      </div>
      
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.name" placeholder="请输入用户名" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名">
          <el-input v-model="searchForm.realName" placeholder="请输入真实姓名" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="任务角色">
          <el-select v-model="searchForm.taskRole" placeholder="请选择角色" style="width: 150px;" clearable>
            <el-option label="负责人" value="ASSIGNEE"></el-option>
            <el-option label="协作者" value="COLLABORATOR"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="searchForm.department" placeholder="请输入部门" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 成员表格 -->
      <el-table 
        :data="membersList" 
        stripe 
        border 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        :cell-style="{padding: '8px 0'}" 
        :header-cell-style="{padding: '8px 0'}"
      >
        <el-table-column type="selection" width="50" align="center"></el-table-column>
        <el-table-column prop="userId" width="90" align="center">
          <template slot="header">
            <div>成员</div>
            <div>ID</div>
          </template>
          <template slot-scope="scope">
            {{ scope.row.userId }}
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="姓名" width="130" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="140" align="center"></el-table-column>
        <el-table-column prop="email" label="邮箱" min-width="220" show-overflow-tooltip></el-table-column>
        <el-table-column prop="department" label="部门" width="140" align="center"></el-table-column>
        <el-table-column prop="taskRole" label="任务角色" width="140" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTaskRoleType(scope.row.taskRole)" size="small">
              {{ getTaskRoleText(scope.row.taskRole) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.status)" size="small">
              {{ getStatusTagText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="joinDate" label="加入时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatDate(scope.row.joinDate) }}
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
      
      <!-- 批量操作按钮 -->
      <div class="batch-actions" v-if="canManageMembers && selectedMembers.length > 0">
        <el-button type="danger" size="small" @click="handleBatchRemove">批量移除 ({{ selectedMembers.length }})</el-button>
      </div>
      
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
    <task-member-form-modal
      :visible.sync="addMemberDialogVisible"
      title="添加任务成员"
      :member="addMemberForm"
      :available-users="availableUsers"
      @confirm="handleAddMember"
    ></task-member-form-modal>
    
    <!-- 修改角色对话框 -->
    <task-member-form-modal
      :visible.sync="editRoleDialogVisible"
      title="修改成员角色"
      :member="editRoleForm"
      :available-users="availableUsers"
      @confirm="handleUpdateRole"
    ></task-member-form-modal>
  </div>
</template>

<script>
import { getTaskMembers, addTaskMember, deleteTaskMembers, updateTaskMemberRole, activateTaskMember } from '../api/taskMembers'
import { getTaskDetail } from '../api/tasks'
import { getProjectMembers } from '../api/projects'
import { mapGetters } from 'vuex'
import TaskMemberFormModal from '../components/TaskMemberFormModal.vue'

export default {
  name: 'TaskMembersView',
  components: {
    TaskMemberFormModal
  },
  data() {
    return {
      loading: false,
      projectId: null,
      taskId: null,
      taskInfo: {
        title: '',
        description: '',
        assigneeName: '',
        deadline: '',
        status: ''
      },
      membersList: [],
      selectedMembers: [],
      searchForm: {
        name: '',
        realName: '',
        taskRole: '',
        department: ''
      },
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      availableUsers: [],
      usersLoaded: false,
      addMemberDialogVisible: false,
      editRoleDialogVisible: false,
      addMemberForm: {
        userId: null,
        taskRole: 'COLLABORATOR'
      },
      editRoleForm: {
        userId: null,
        taskRole: 'COLLABORATOR'
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
    },
    canViewMembers() {
      return this.userInfo !== null
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    getStatusType(status) {
      const types = {
        NOT_STARTED: 'info',
        IN_PROGRESS: 'success',
        DELAY: 'warning',
        COMPLETED: 'primary',
        CANCELLED: 'danger'
      }
      return types[status] || 'info'
    },
    getStatusText(status) {
      const texts = {
        NOT_STARTED: '未开始',
        IN_PROGRESS: '进行中',
        DELAY: '已延期',
        COMPLETED: '已完成',
        CANCELLED: '已取消'
      }
      return texts[status] || status
    },
    getTaskRoleType(role) {
      const types = {
        ASSIGNEE: 'danger',
        COLLABORATOR: 'success',
        '负责人': 'danger',
        '协作者': 'success'
      }
      return types[role] || 'info'
    },
    getTaskRoleText(role) {
      const texts = {
        ASSIGNEE: '负责人',
        COLLABORATOR: '协作者',
        '负责人': '负责人',
        '协作者': '协作者'
      }
      return texts[role] || role
    },
    getStatusTagType(status) {
      const types = {
        ACTIVE: 'success',
        INACTIVE: 'info',
        '正常': 'success',
        '禁用': 'info'
      }
      return types[status] || 'info'
    },
    getStatusTagText(status) {
      const texts = {
        ACTIVE: '正常',
        INACTIVE: '禁用',
        '正常': '正常',
        '禁用': '禁用'
      }
      return texts[status] || status
    },
    async loadTaskInfo() {
      try {
        const response = await getTaskDetail(this.projectId, this.taskId)
        const taskData = response.data
        this.taskInfo = {
          title: taskData.title || '',
          description: taskData.description || '',
          assigneeName: taskData.assigneeName || '',
          deadline: taskData.deadline || '',
          status: taskData.status || ''
        }
      } catch (error) {
        this.$message.error('加载任务信息失败')
        console.error(error)
      }
    },
    async loadMembersList() {
      try {
        const params = {
          page: this.pagination.currentPage,
          pageSize: this.pagination.pageSize
        }
        
        if (this.searchForm.name) {
          params.name = this.searchForm.name
        }
        if (this.searchForm.realName) {
          params.realName = this.searchForm.realName
        }
        if (this.searchForm.taskRole) {
          params.taskRole = this.searchForm.taskRole
        }
        if (this.searchForm.department) {
          params.department = this.searchForm.department
        }
        
        const response = await getTaskMembers(this.projectId, this.taskId, params)
        this.membersList = response.data.rows
        this.pagination.total = response.data.total
      } catch (error) {
        this.$message.error('加载任务成员列表失败')
        console.error(error)
      }
    },
    async loadAvailableUsers() {
      if (this.usersLoaded) {
        return
      }
      try {
        const response = await getProjectMembers({
          id: this.projectId,
          page: 1,
          pageSize: 1000
        })
        
        const existingMemberUserIds = new Set(this.membersList.map(member => member.userId || member.id))
        
        this.availableUsers = response.data.rows
          .filter(member => {
            const userId = member.userId || member.user_id
            const isTaskMember = existingMemberUserIds.has(userId)
            const isProjectManager = member.projectRole === 'PROJECT_MANAGER'
            return !isTaskMember && !isProjectManager
          })
          .map(member => ({
            id: member.userId || member.user_id,
            realName: member.realName || member.real_name,
            username: member.username,
            email: member.email,
            department: member.department
          }))
        this.usersLoaded = true
      } catch (error) {
        this.$message.error('加载项目成员列表失败')
        console.error(error)
      }
    },
    handleSearch() {
      this.pagination.currentPage = 1
      this.loadMembersList()
    },
    handleReset() {
      this.searchForm = {
        name: '',
        realName: '',
        taskRole: '',
        department: ''
      }
      this.pagination.currentPage = 1
      this.loadMembersList()
    },
    handleSelectionChange(selection) {
      this.selectedMembers = selection
    },
    handleCurrentChange(currentPage) {
      this.pagination.currentPage = currentPage
      this.loadMembersList()
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.currentPage = 1
      this.loadMembersList()
    },
    showAddMemberDialog() {
      this.addMemberForm = {
        userId: null,
        taskRole: 'COLLABORATOR'
      }
      this.loadAvailableUsers()
      this.addMemberDialogVisible = true
    },
    showEditRoleDialog(member) {
      this.editRoleForm = {
        id: member.id,
        userId: member.userId || member.id,
        role: member.taskRole,
        realName: member.realName,
        username: member.username
      }
      this.editRoleDialogVisible = true
    },
    async handleAddMember(formData) {
      try {
        const memberData = {
          userId: formData.userId,
          taskRole: formData.taskRole
        }
        await addTaskMember(this.projectId, this.taskId, memberData)
        this.$message.success('成员添加成功')
        this.addMemberDialogVisible = false
        this.loadMembersList()
      } catch (error) {
        this.$message.error('添加成员失败')
        console.error(error)
      }
    },
    async handleUpdateRole(formData) {
      try {
        await updateTaskMemberRole(
          this.projectId,
          this.taskId,
          formData.userId,
          formData.role,
          this.userInfo.id
        )
        this.$message.success('角色更新成功')
        this.editRoleDialogVisible = false
        this.loadMembersList()
      } catch (error) {
        this.$message.error('更新角色失败')
        console.error(error)
      }
    },
    async handleActivateMember(member) {
      this.$confirm('确定要激活该成员吗？', '激活确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        try {
          const userId = member.userId || member.id
          await activateTaskMember(this.projectId, this.taskId, userId)
          this.$message.success('成员激活成功')
          this.loadMembersList()
        } catch (error) {
          this.$message.error('激活成员失败')
          console.error(error)
        }
      }).catch(() => {})
    },
    handleRemoveMember(member) {
      this.$confirm('确定要将该成员移出任务吗？', '移除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const userId = member.userId || member.id
          await deleteTaskMembers(this.projectId, this.taskId, [userId])
          this.$message.success('成员移出成功')
          this.loadMembersList()
        } catch (error) {
          this.$message.error('移出成员失败')
          console.error(error)
        }
      }).catch(() => {})
    },
    handleBatchRemove() {
      this.$confirm(`确定要将选中的 ${this.selectedMembers.length} 位成员移出任务吗？`, '批量移除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const userIds = this.selectedMembers.map(member => member.userId || member.id)
          await deleteTaskMembers(this.projectId, this.taskId, userIds)
          this.$message.success('批量移出成功')
          this.selectedMembers = []
          this.loadMembersList()
        } catch (error) {
          this.$message.error('批量移出失败')
          console.error(error)
        }
      }).catch(() => {})
    }
  },
  watch: {
    '$route'(to, from) {
      if (to.params.projectId !== from.params.projectId || to.params.taskId !== from.params.taskId) {
        this.projectId = to.params.projectId
        this.taskId = to.params.taskId
        this.loading = true
        if (this.projectId && this.taskId) {
          Promise.all([
            this.loadTaskInfo(),
            this.loadMembersList()
          ]).finally(() => {
            this.loading = false
          })
        } else {
          this.loading = false
          this.$message.error('项目ID或任务ID不存在')
          this.$router.push('/projects')
        }
      }
    }
  },
  mounted() {
    this.loading = true
    this.projectId = this.$route.params.projectId
    this.taskId = this.$route.params.taskId
    
    if (this.projectId && this.taskId) {
      Promise.all([
        this.loadTaskInfo(),
        this.loadMembersList()
      ]).finally(() => {
        this.loading = false
      })
    } else {
      this.loading = false
      this.$message.error('项目ID或任务ID不存在')
      this.$router.push('/projects')
    }
  }
}
</script>

<style scoped>
.task-members-container {
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

.task-info-card {
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: none;
}

.task-info {
  padding: 10px 0;
}

.task-info h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #1e293b;
  font-weight: 700;
}

.task-description {
  margin: 0 0 16px 0;
  color: #475569;
  line-height: 1.6;
  font-size: 15px;
}

.task-meta {
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

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .el-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.header-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.search-form {
  margin-bottom: 20px;
}

.search-form .el-form-item {
  margin-bottom: 12px;
}

.batch-actions {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.batch-actions .el-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
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
