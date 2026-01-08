<template>
  <div class="my-tasks-container" v-loading="loading" element-loading-text="数据加载中...">
    <h2 class="page-title">{{ isAdmin ? '任务管理' : '我的任务' }}</h2>
    
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
          <el-select v-model="searchForm.projectId" placeholder="全部项目" clearable>
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
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="未开始" value="NOT_STARTED"></el-option>
            <el-option label="进行中" value="IN_PROGRESS"></el-option>
            <el-option label="已延期" value="DELAY"></el-option>
            <el-option label="已完成" value="COMPLETED"></el-option>
            <el-option label="已取消" value="CANCELLED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            @change="handleDateChange"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 任务列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table :data="tasksList" stripe border style="width: 100%">
        <el-table-column prop="id" label="任务ID" width="70" align="center"></el-table-column>
        <el-table-column prop="title" label="任务名称" min-width="150">
          <template slot-scope="scope">
            <span style="color: #409EFF; cursor: pointer;" @click="handleViewTask(scope.row)">
              {{ scope.row.title }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="所属项目" width="150"></el-table-column>
        <el-table-column prop="assigneeName" label="负责人" width="100"></el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small" style="font-size: 12px;">
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
        <el-table-column label="操作" width="320" align="center" v-if="canShowActionColumn">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 5px;">
              <el-button type="primary" size="mini" @click="handleEditTask(scope.row)" v-if="canEditTask(scope.row)">编辑</el-button>
              <el-button type="success" size="mini" @click="handleManageMembers(scope.row)">成员管理</el-button>
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
    
    <!-- 任务详情对话框 -->
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
          <el-descriptions-item label="所属项目">{{ currentTask.projectName || '未分配' }}</el-descriptions-item>
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
import { getMyTasks } from '../api/tasks'
import { getProjects } from '../api/projects'
import { mapGetters } from 'vuex'

export default {
  name: 'MyTasksView',
  data() {
    return {
      loading: false,
      searchForm: {
        id: null,
        title: '',
        projectId: null,
        assigneeName: '',
        status: null,
        begin: null,
        end: null
      },
      dateRange: [],
      tasksList: [],
      projectsList: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      detailDialogVisible: false,
      currentTask: {}
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    isAdmin() {
      return this.userInfo !== null && this.userInfo.role === 'ADMIN'
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
    handleDateChange(dates) {
      if (dates && dates.length === 2) {
        this.searchForm.begin = dates[0]
        this.searchForm.end = dates[1]
      } else {
        this.searchForm.begin = null
        this.searchForm.end = null
      }
    },
    async loadMyTasks() {
      try {
        const params = {
          ...this.searchForm,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        const response = await getMyTasks(params)
        this.tasksList = response.data.rows
        this.pagination.total = response.data.total
      } catch (error) {
        this.$message.error(this.isAdmin ? '加载任务管理列表失败' : '加载我的任务列表失败')
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
    handleSearch() {
      this.pagination.page = 1
      this.loadMyTasks()
    },
    handleReset() {
      this.searchForm = {
        id: null,
        title: '',
        projectId: null,
        assigneeName: '',
        status: null,
        begin: null,
        end: null
      }
      this.dateRange = []
      this.pagination.page = 1
      this.loadMyTasks()
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.page = 1
      this.loadMyTasks()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadMyTasks()
    },
    handleViewTask(task) {
      this.currentTask = { ...task }
      this.detailDialogVisible = true
    },
    canEditTask(task) {
      if (!this.userInfo) return false
      if (this.userInfo.role === 'ADMIN') return true
      if (this.userInfo.role === 'PROJECT_MANAGER') return true
      if (task && task.assigneeId === this.userInfo.id) return true
      return false
    },
    handleEditTask(task) {
      if (task && task.projectId) {
        this.$router.push({
          path: `/projects/${task.projectId}/tasks`,
          query: { editTaskId: task.id }
        })
      }
    },
    handleManageMembers(task) {
      if (task && task.projectId && task.id) {
        this.$router.push(`/projects/${task.projectId}/tasks/${task.id}/members`)
      }
    }
  },
  mounted() {
    this.loading = true
    Promise.all([
      this.loadProjects(),
      this.loadMyTasks()
    ]).finally(() => {
      this.loading = false
    })
  }
}
</script>

<style scoped>
.my-tasks-container {
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

.table-card {
  margin: 0 24px 20px 24px;
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
