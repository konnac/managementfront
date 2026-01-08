<template>
  <div class="project-tasks-container">
    <div class="page-header">
      <h2 class="page-title">项目任务管理</h2>
      <el-button type="primary" @click="goBack">返回项目列表</el-button>
    </div>

    <el-alert
      title="任务完成证明请移至项目文档库"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 15px;">
    </el-alert>

    <el-card class="project-info-card" shadow="hover" v-if="projectInfo">
      <div class="project-info">
        <h3>{{ projectInfo.name }}</h3>
        <p>{{ projectInfo.description }}</p>
        <div class="project-meta">
          <span>负责人: {{ projectInfo.managerName }}</span>
          <span>状态: {{ getStatusText(projectInfo.status) }}</span>
        </div>
      </div>
    </el-card>
    
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务ID">
          <el-input v-model.number="searchForm.id" placeholder="请输入任务ID" style="width: 100px;"></el-input>
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input v-model="searchForm.title" placeholder="请输入任务名称" style="width: 150px;"></el-input>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="searchForm.assigneeName" placeholder="请输入负责人姓名" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px;">
            <el-option label="未开始" value="NOT_STARTED"></el-option>
            <el-option label="进行中" value="IN_PROGRESS"></el-option>
            <el-option label="已延期" value="DELAY"></el-option>
            <el-option label="已完成" value="COMPLETED"></el-option>
            <el-option label="已取消" value="CANCELLED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleSearch">搜索</el-button>
          <el-button size="small" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="success" @click="handleAddTask" v-if="canAddTask">添加任务</el-button>
        <el-button type="danger" :disabled="selectedTasks.length === 0" @click="handleBatchDelete" v-if="canShowBatchDelete">批量删除</el-button>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      <el-table :data="tasksList" stripe border @selection-change="handleSelectionChange" style="width: 100%">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column prop="id" label="任务ID" width="70" align="center"></el-table-column>
        <el-table-column prop="title" label="任务名称" min-width="150">
          <template slot-scope="scope">
            <span style="color: #409EFF; cursor: pointer;" @click="handleViewTask(scope.row)">
              {{ scope.row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="负责人" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="estimatedHours" label="预计工时" width="90" align="center"></el-table-column>
        <el-table-column prop="actualHours" label="实际工时" width="90" align="center"></el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="135" align="center"></el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="135" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" align="center" v-if="canShowActionColumn">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 5px;">
              <el-button type="primary" size="mini" @click="handleEditTask(scope.row)" v-if="canEditTask(scope.row)">编辑</el-button>
              <el-button type="success" size="mini" @click="handleManageMembers(scope.row)">成员管理</el-button>
              <el-button type="danger" size="mini" @click="handleDeleteTask(scope.row.id)" v-if="canDeleteTask(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
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
    
    <task-form-modal
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :task="taskForm"
      :available-users="projectMembersList"
      :is-edit="isEditMode"
      :is-assignee="isAssignee"
      @confirm="handleSaveTask"
    ></task-form-modal>

    <el-dialog
      title="任务详情"
      :visible.sync="detailDialogVisible"
      width="600px"
      :append-to-body="true"
    >
      <div class="task-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="任务ID">{{ currentTask.id }}</el-descriptions-item>
          <el-descriptions-item label="任务名称">{{ currentTask.title }}</el-descriptions-item>
          <el-descriptions-item label="任务描述">
            <div style="white-space: pre-wrap; max-height: 200px; overflow-y: auto;">{{ currentTask.description || '暂无描述' }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentTask.assigneeName || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTask.status)" size="small">
              {{ getStatusText(currentTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="预计工时">{{ currentTask.estimatedHours }} 小时</el-descriptions-item>
          <el-descriptions-item label="实际工时">{{ currentTask.actualHours }} 小时</el-descriptions-item>
          <el-descriptions-item label="截止日期">{{ currentTask.deadline || '未设置' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDateTime(currentTask.createdTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getTasks, addTask, deleteTask, updateTask } from '../api/tasks'
import { getProjects, getProjectMembers } from '../api/projects'
import { mapGetters } from 'vuex'
import TaskFormModal from '../components/TaskFormModal.vue'

export default {
  name: 'ProjectTasksView',
  components: {
    TaskFormModal
  },
  data() {
    return {
      projectId: null,
      projectInfo: null,
      searchForm: {
        id: null,
        title: '',
        assigneeName: '',
        status: ''
      },
      tasksList: [],
      projectMembersList: [],
      selectedTasks: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '添加任务',
      isEditMode: false,
      isAssignee: false,
      taskForm: {
        id: null,
        title: '',
        description: '',
        assigneeId: null,
        status: 'NOT_STARTED',
        estimatedHours: 0,
        actualHours: 0,
        deadline: null
      },
      taskRules: {
        title: [
          { required: true, message: '请输入任务名称', trigger: 'blur' },
          { min: 3, max: 50, message: '任务名称长度在 3 到 50 个字符', trigger: 'blur' }
        ],
        description: [
          { max: 200, message: '任务描述不能超过 200 个字符', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ],
        estimatedHours: [
          { required: true, message: '请输入预计工时', trigger: 'blur' },
          { type: 'number', min: 0, message: '预计工时不能小于0', trigger: 'blur' }
        ],
        actualHours: [
          { required: true, message: '请输入实际工时', trigger: 'blur' },
          { type: 'number', min: 0, message: '实际工时不能小于0', trigger: 'blur' }
        ],
        deadline: [
          { required: true, message: '请选择截止日期', trigger: 'change' }
        ]
      },
      detailDialogVisible: false,
      currentTask: {}
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    canAddTask() {
      return this.userInfo && (this.userInfo.role === 'ADMIN' || this.userInfo.role === 'PROJECT_MANAGER')
    },
    canShowBatchDelete() {
      if (!this.userInfo) return false
      if (this.userInfo.role === 'ADMIN') return true
      if (this.userInfo.role === 'PROJECT_MANAGER') return true
      return this.selectedTasks.some(task => task.assigneeId === this.userInfo.id)
    },
    canDeleteTask() {
      return (task) => {
        if (!this.userInfo) return false
        if (this.userInfo.role === 'ADMIN') return true
        if (this.userInfo.role === 'PROJECT_MANAGER') return true
        if (task && task.assigneeId === this.userInfo.id) return true
        return false
      }
    },
    canEditTask() {
      return (task) => {
        if (!this.userInfo) return false
        if (this.userInfo.role === 'ADMIN') return true
        if (this.userInfo.role === 'PROJECT_MANAGER') return true
        if (task && task.assigneeId === this.userInfo.id) return true
        return false
      }
    },
    canShowActionColumn() {
      return this.userInfo !== null
    }
  },
  methods: {
    formatDateTime(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    goBack() {
      this.$router.push('/projects')
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
        CANCELLED: '已取消',
        NOT_STARTED_PROJECT: '未开始',
        IN_PROGRESS_PROJECT: '进行中',
        COMPLETED_PROJECT: '已完成',
        CANCELLED_PROJECT: '已取消'
      }
      return texts[status] || status
    },
    async loadProjectInfo() {
      try {
        const response = await getProjects({ id: this.projectId, page: 1, pageSize: 1 })
        if (response.data.rows && response.data.rows.length > 0) {
          this.projectInfo = response.data.rows[0]
        }
      } catch (error) {
        this.$message.error('加载项目信息失败')
        console.error(error)
      }
    },
    async loadTasks() {
      try {
        const params = {
          ...this.searchForm,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        const response = await getTasks(this.projectId, params)
        this.tasksList = response.data.rows
        this.pagination.total = response.data.total
      } catch (error) {
        this.$message.error('加载任务列表失败')
        console.error(error)
      }
    },
    async loadProjectMembers() {
      try {
        const response = await getProjectMembers({ id: this.projectId, page: 1, pageSize: 1000 })
        this.projectMembersList = response.data.rows.map(member => ({
          id: member.userId || member.user_id || member.pmId || member.pm_id,
          realName: member.realName || member.real_name || member.name || '未知'
        }))
      } catch (error) {
        this.$message.error('加载项目成员列表失败')
        console.error(error)
      }
    },
    handleSearch() {
      this.pagination.page = 1
      this.loadTasks()
    },
    handleReset() {
      this.searchForm = {
        id: null,
        title: '',
        assigneeName: '',
        status: ''
      }
      this.pagination.page = 1
      this.loadTasks()
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.page = 1
      this.loadTasks()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadTasks()
    },
    handleSelectionChange(selection) {
      this.selectedTasks = selection
    },
    handleViewTask(task) {
      this.currentTask = { ...task }
      this.detailDialogVisible = true
    },
    handleManageMembers(task) {
      this.$router.push(`/projects/${this.projectId}/tasks/${task.id}/members`)
    },
    handleAddTask() {
      this.dialogTitle = '添加任务'
      this.isEditMode = false
      this.isAssignee = false
      this.taskForm = {
        id: null,
        title: '',
        description: '',
        assigneeId: null,
        status: 'NOT_STARTED',
        estimatedHours: 0,
        actualHours: 0,
        deadline: null
      }
      this.dialogVisible = true
    },
    handleEditTask(task) {
      this.dialogTitle = '编辑任务'
      this.isEditMode = true
      this.isAssignee = this.userInfo && 
                       this.userInfo.role !== 'ADMIN' && 
                       this.userInfo.role !== 'PROJECT_MANAGER' && 
                       task.assigneeId === this.userInfo.id
      this.taskForm = {
        ...task,
        deadline: task.deadline ? new Date(task.deadline) : null
      }
      this.dialogVisible = true
    },
    async handleSaveTask(formData) {
      try {
        const data = {
          ...formData,
          deadline: formData.deadline ? this.formatDate(new Date(formData.deadline)) : null
        }
        
        if (data.id) {
          await updateTask(this.projectId, data.id, data)
          this.$message.success('任务更新成功')
        } else {
          await addTask(this.projectId, data)
          this.$message.success('任务添加成功')
        }
        this.loadTasks()
      } catch (error) {
        this.$message.error('操作失败')
        console.error(error)
      }
    },
    formatDate(date) {
      if (!date) return null
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    async handleDeleteTask(id) {
      this.$confirm('确定要删除该任务吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteTask(this.projectId, [id])
          this.$message.success('任务删除成功')
          this.loadTasks()
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {
      })
    },
    async handleBatchDelete() {
      if (this.selectedTasks.length === 0) {
        this.$message.warning('请选择要删除的任务')
        return
      }
      
      this.$confirm('确定要批量删除选中的任务吗？', '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedTasks.map(task => task.id)
          await deleteTask(this.projectId, ids)
          this.$message.success('批量删除成功')
          this.selectedTasks = []
          this.loadTasks()
        } catch (error) {
          this.$message.error('批量删除失败')
          console.error(error)
        }
      }).catch(() => {
      })
    }
  },
  mounted() {
    this.loading = true
    this.projectId = this.$route.params.id
    if (this.projectId) {
      Promise.all([
        this.loadProjectInfo(),
        this.loadTasks(),
        this.loadProjectMembers()
      ]).then(() => {
        const editTaskId = this.$route.query.editTaskId
        if (editTaskId) {
          const taskToEdit = this.tasksList.find(task => task.id === parseInt(editTaskId))
          if (taskToEdit) {
            this.handleEditTask(taskToEdit)
          }
        }
      }).finally(() => {
        this.loading = false
      })
    } else {
      this.loading = false
    }
  },
  watch: {
    '$route.params.id'(newId) {
      if (newId) {
        this.projectId = newId
        this.loadProjectInfo()
        this.loadTasks()
      }
    }
  }
}
</script>

<style scoped>
.project-tasks-container {
  padding: 24px;
  width: 100%;
  margin: 0 auto;
  background: #f8fafc;
  min-height: calc(100vh - 120px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header .el-button {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.page-header .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.project-info-card {
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: none;
}

.project-info h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #1e293b;
  font-weight: 700;
}

.project-info p {
  margin: 0 0 16px 0;
  color: #475569;
  font-size: 15px;
  line-height: 1.6;
}

.project-meta {
  display: flex;
  gap: 24px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.project-meta span {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
}

.search-card {
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  border: none;
}

.search-form {
  margin-bottom: 16px;
}

.search-form .el-form-item {
  margin-bottom: 12px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.action-buttons .el-button {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.table-card {
  margin-bottom: 20px;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #ffffff;
  border: none;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
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

.el-alert {
  border-radius: 8px;
  margin-bottom: 20px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>
