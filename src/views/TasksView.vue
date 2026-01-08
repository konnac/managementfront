<template>
  <div class="tasks-container" v-loading="loading" element-loading-text="数据加载中...">
    <h2 class="page-title">任务管理</h2>
    
    <el-alert
      title="任务完成证明请移至项目文档库"
      type="info"
      :closable="false"
      show-icon
      style="margin-bottom: 15px;">
    </el-alert>
    
    <!-- 搜索和操作区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="任务ID">
          <el-input v-model.number="searchForm.id" placeholder="请输入任务ID" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input v-model="searchForm.title" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="项目">
          <el-select v-model="searchForm.projectId" placeholder="请选择项目">
            <el-option
              v-for="project in projectsList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="searchForm.assigneeName" placeholder="请输入负责人姓名"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="未开始" value="NOT_STARTED"></el-option>
            <el-option label="进行中" value="IN_PROGRESS"></el-option>
            <el-option label="已延期" value="DELAY"></el-option>
            <el-option label="已完成" value="COMPLETED"></el-option>
            <el-option label="已取消" value="CANCELLED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="success" @click="handleAddTask" v-if="canAddTask">添加任务</el-button>
        <el-button type="danger" :disabled="selectedTasks.length === 0" @click="handleBatchDelete" v-if="canDeleteTask">批量删除</el-button>
      </div>
    </el-card>
    
    <!-- 任务列表 -->
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
              <el-button type="danger" size="mini" @click="handleDeleteTask(scope.row.id)" v-if="canDeleteSingleTask(scope.row)">删除</el-button>
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
    
    <!-- 添加/编辑任务对话框 -->
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
  name: 'TasksView',
  components: {
    TaskFormModal
  },
  data() {
    return {
      loading: false,
      searchForm: {
        id: null,
        title: '',
        projectId: '',
        assigneeName: '',
        status: ''
      },
      tasksList: [],
      projectsList: [],
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
        projectId: null,
        assigneeId: null,
        status: 'NOT_STARTED',
        estimatedHours: 0,
        actualHours: 0,
        deadline: null
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
    canDeleteTask() {
      if (!this.userInfo) return false
      if (this.userInfo.role === 'ADMIN') return true
      if (this.userInfo.role === 'PROJECT_MANAGER') return true
      return this.selectedTasks.some(task => task.assigneeId === this.userInfo.id)
    },
    canDeleteSingleTask() {
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
    // 加载任务列表
    async loadTasks() {
      if (!this.searchForm.projectId) {
        this.tasksList = []
        this.pagination.total = 0
        this.$message.warning('请先选择项目')
        return
      }
      try {
        const params = {
          ...this.searchForm,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        const response = await getTasks(this.searchForm.projectId, params)
        this.tasksList = response.data.rows
        this.pagination.total = response.data.total
      } catch (error) {
        this.$message.error('加载任务列表失败')
        console.error(error)
      }
    },
    async loadProjectMembers() {
      if (!this.searchForm.projectId) {
        this.projectMembersList = []
        return
      }
      try {
        const response = await getProjectMembers({ id: this.searchForm.projectId, page: 1, pageSize: 1000 })
        this.projectMembersList = response.data.rows.map(member => ({
          id: member.userId || member.user_id || member.pmId || member.pm_id,
          realName: member.realName || member.real_name || member.name || '未知'
        }))
      } catch (error) {
        this.$message.error('加载项目成员列表失败')
        console.error(error)
      }
    },
    async loadProjects() {
      try {
        const response = await getProjects({ page: 1, pageSize: 1000 })
        this.projectsList = response.data.rows
      } catch (error) {
        this.$message.error('加载项目列表失败')
        console.error(error)
      }
    },
    // 搜索任务
    handleSearch() {
      this.pagination.page = 1
      this.loadTasks()
    },
    // 重置搜索
    handleReset() {
      this.searchForm = {
        id: null,
        title: '',
        projectId: '',
        assigneeName: '',
        status: ''
      }
      this.pagination.page = 1
      this.loadTasks()
    },
    // 分页大小改变
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.page = 1
      this.loadTasks()
    },
    // 当前页码改变
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadTasks()
    },
    // 选择任务
    handleSelectionChange(selection) {
      this.selectedTasks = selection
    },
    // 查看任务详情
    handleViewTask(task) {
      this.currentTask = { ...task }
      this.detailDialogVisible = true
    },
    // 添加任务
    handleAddTask() {
      this.dialogTitle = '添加任务'
      this.isEditMode = false
      this.isAssignee = false
      this.taskForm = {
        id: null,
        title: '',
        description: '',
        projectId: this.searchForm.projectId,
        assigneeId: null,
        status: 'NOT_STARTED',
        estimatedHours: 0,
        actualHours: 0,
        deadline: null
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.taskForm.clearValidate()
      })
    },
    handleEditTask(task) {
      this.dialogTitle = '编辑任务'
      this.isEditMode = true
      this.taskForm = { ...task }
      this.isAssignee = this.userInfo && 
                       this.userInfo.role !== 'ADMIN' && 
                       this.userInfo.role !== 'PROJECT_MANAGER' && 
                       task.assigneeId === this.userInfo.id
      this.dialogVisible = true
    },
    // 保存任务
    async handleSaveTask(formData) {
      if (!formData.projectId) {
        this.$message.warning('请先选择项目')
        return
      }
      try {
        if (formData.id) {
          await updateTask(formData.projectId, formData.id, formData)
          this.$message.success('任务更新成功')
        } else {
          await addTask(formData.projectId, formData)
          this.$message.success('任务添加成功')
        }
        this.loadTasks()
      } catch (error) {
        this.$message.error('操作失败')
        console.error(error)
      }
    },
    // 删除任务
    async handleDeleteTask(id) {
      if (!this.searchForm.projectId) {
        this.$message.warning('请先选择项目')
        return
      }
      this.$confirm('确定要删除该任务吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteTask(this.searchForm.projectId, [id])
          this.$message.success('任务删除成功')
          this.loadTasks()
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {
      })
    },
    // 批量删除任务
    async handleBatchDelete() {
      if (this.selectedTasks.length === 0) {
        this.$message.warning('请选择要删除的任务')
        return
      }
      if (!this.searchForm.projectId) {
        this.$message.warning('请先选择项目')
        return
      }
      
      this.$confirm('确定要批量删除选中的任务吗？', '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedTasks.map(task => task.id)
          await deleteTask(this.searchForm.projectId, ids)
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
    this.loadProjects()
      .then(() => {
        if (this.projectsList.length > 0) {
          this.searchForm.projectId = this.projectsList[0].id
          this.loadTasks()
          this.loadProjectMembers()
        }
      })
      .finally(() => {
        this.loading = false
      })
  },
  watch: {
    'searchForm.projectId'(newVal) {
      if (newVal) {
        this.loadProjectMembers()
      }
    }
  }
}
</script>

<style scoped>
.tasks-container {
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

.el-table .el-button--mini {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-table .el-button--mini:hover {
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

.task-detail {
  padding: 8px 0;
}

.el-descriptions {
  border-radius: 8px;
  overflow: hidden;
}

.el-descriptions__label {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

.el-descriptions__content {
  color: #1e293b;
}

.el-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 4px 12px;
}

.el-alert {
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
}

.el-alert__title {
  color: #0369a1;
  font-weight: 500;
}
</style>
