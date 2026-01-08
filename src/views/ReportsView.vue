<template>
  <div class="reports-container">
    <h2 class="page-title">{{ isAdmin ? '报表管理' : '我的报表' }}</h2>
    
    <el-card class="content-card" shadow="hover">
      <div class="filter-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="报表类型">
            <el-select v-model="searchForm.reportType" placeholder="全部类型" clearable>
              <el-option label="周报" value="WEEKLY"></el-option>
              <el-option label="月报" value="MONTHLY"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="提交人">
            <el-input v-model="searchForm.userName" placeholder="输入姓名" clearable></el-input>
          </el-form-item>
          <el-form-item label="提交时间">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div class="action-bar">
          <el-button type="primary" icon="el-icon-plus" @click="handleCreate">填写周报/月报</el-button>
        </div>
      </div>

      <el-table :data="reportsList" v-loading="loading" border stripe>
        <el-table-column prop="userName" label="提交人" width="120"></el-table-column>
        <el-table-column prop="reportType" label="报表类型" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.reportType === 'WEEKLY' ? 'success' : 'warning'">
              {{ scope.row.reportType === 'WEEKLY' ? '周报' : '月报' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workContent" label="工作内容" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.submitTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button type="success" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total">
        </el-pagination>
      </div>
    </el-card>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      :close-on-click-modal="false"
      append-to-body>
      <el-form :model="reportForm" :rules="rules" ref="reportForm" label-width="100px">
        <el-form-item label="报表类型" prop="reportType">
          <el-select v-model="reportForm.reportType" placeholder="请选择报表类型" :disabled="isEdit">
            <el-option label="周报" value="WEEKLY"></el-option>
            <el-option label="月报" value="MONTHLY"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="已完成任务">
          <el-button type="primary" size="small" @click="loadCompletedTasks" :loading="loadingTasks">
            自动填充本周/本月已完成任务
          </el-button>
          <div v-if="completedTasksList.length > 0" class="completed-tasks-list">
            <el-tag
              v-for="task in completedTasksList"
              :key="task.id"
              size="small"
              closable
              @close="removeTask(task.id)"
              style="margin: 5px;">
              {{ task.title }} ({{ task.projectName }})
            </el-tag>
          </div>
        </el-form-item>
        <el-form-item label="工作内容" prop="workContent">
          <el-input
            type="textarea"
            :rows="6"
            v-model="reportForm.workContent"
            placeholder="请输入本周/本月的工作内容">
          </el-input>
        </el-form-item>
        <el-form-item label="下周/下月计划" prop="nextPlan">
          <el-input
            type="textarea"
            :rows="4"
            v-model="reportForm.nextPlan"
            placeholder="请输入下周/下月的工作计划">
          </el-input>
        </el-form-item>
        <el-form-item label="遇到的问题" prop="problems">
          <el-input
            type="textarea"
            :rows="4"
            v-model="reportForm.problems"
            placeholder="请输入遇到的问题（可选）">
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </el-dialog>

    <el-dialog
      title="查看报表详情"
      :visible.sync="viewDialogVisible"
      width="800px"
      append-to-body>
      <div v-if="currentReport" class="report-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="提交人">{{ currentReport.userName }}</el-descriptions-item>
          <el-descriptions-item label="报表类型">
            {{ currentReport.reportType === 'WEEKLY' ? '周报' : '月报' }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDate(currentReport.submitTime) }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section">
          <h4>工作内容</h4>
          <p>{{ currentReport.workContent || '暂无' }}</p>
        </div>
        
        <div class="detail-section">
          <h4>已完成任务</h4>
          <div v-if="currentReport.completedTasks" class="tasks-list">
            <el-tag
              v-for="task in JSON.parse(currentReport.completedTasks)"
              :key="task.id"
              size="small"
              style="margin: 5px;">
              {{ task.title }} ({{ task.projectName }})
            </el-tag>
          </div>
          <p v-else>暂无</p>
        </div>
        
        <div class="detail-section">
          <h4>下周/下月计划</h4>
          <p>{{ currentReport.nextPlan || '暂无' }}</p>
        </div>
        
        <div class="detail-section">
          <h4>遇到的问题</h4>
          <p>{{ currentReport.problems || '无' }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getReports, addReport, updateReport, getCompletedTasksByPeriod } from '@/api/reports'
import { mapGetters } from 'vuex'

export default {
  name: 'ReportsView',
  data() {
    return {
      reportsList: [],
      loading: false,
      searchForm: {
        reportType: '',
        userName: ''
      },
      dateRange: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      viewDialogVisible: false,
      dialogTitle: '填写报表',
      isEdit: false,
      reportForm: {
        reportType: 'WEEKLY',
        workContent: '',
        completedTasks: '',
        nextPlan: '',
        problems: ''
      },
      rules: {
        reportType: [{ required: true, message: '请选择报表类型', trigger: 'change' }],
        workContent: [{ required: true, message: '请输入工作内容', trigger: 'blur' }]
      },
      completedTasksList: [],
      loadingTasks: false,
      currentReport: null
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    isAdmin() {
      return this.userInfo !== null && this.userInfo.role === 'ADMIN'
    }
  },
  watch: {
    'reportForm.reportType'() {
      this.completedTasksList = []
      this.reportForm.completedTasks = ''
    }
  },
  methods: {
    async loadReports() {
      this.loading = true
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          ...this.searchForm
        }
        
        if (this.dateRange && this.dateRange.length === 2) {
          params.begin = this.dateRange[0]
          params.end = this.dateRange[1]
        }
        
        const response = await getReports(params)
        this.reportsList = response.data.rows
        this.pagination.total = response.data.total
      } catch (error) {
        this.$message.error('加载报表列表失败')
        console.error(error)
      } finally {
        this.loading = false
      }
    },
    
    handleSearch() {
      this.pagination.page = 1
      this.loadReports()
    },
    
    handleReset() {
      this.searchForm = {
        reportType: '',
        userName: ''
      }
      this.dateRange = []
      this.pagination.page = 1
      this.loadReports()
    },
    
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.loadReports()
    },
    
    handleCurrentChange(val) {
      this.pagination.page = val
      this.loadReports()
    },
    
    handleCreate() {
      this.isEdit = false
      this.dialogTitle = '填写报表'
      this.reportForm = {
        reportType: 'WEEKLY',
        workContent: '',
        completedTasks: '',
        nextPlan: '',
        problems: ''
      }
      this.completedTasksList = []
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.reportForm.clearValidate()
      })
    },
    
    handleEdit(row) {
      this.isEdit = true
      this.dialogTitle = '编辑报表'
      this.reportForm = { ...row }
      
      if (row.completedTasks) {
        try {
          this.completedTasksList = JSON.parse(row.completedTasks)
        } catch (e) {
          this.completedTasksList = []
        }
      }
      
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.reportForm.clearValidate()
      })
    },
    
    handleView(row) {
      this.currentReport = row
      this.viewDialogVisible = true
    },
    
    async loadCompletedTasks() {
      if (!this.reportForm.reportType) {
        this.$message.warning('请先选择报表类型')
        return
      }
      
      this.loadingTasks = true
      try {
        const now = new Date()
        let startTime, endTime
        
        if (this.reportForm.reportType === 'WEEKLY') {
          const dayOfWeek = now.getDay()
          const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          startTime = new Date(now)
          startTime.setDate(now.getDate() - diff)
          startTime.setHours(0, 0, 0, 0)
          endTime = new Date(startTime)
          endTime.setDate(startTime.getDate() + 6)
          endTime.setHours(23, 59, 59, 999)
        } else {
          startTime = new Date(now.getFullYear(), now.getMonth(), 1)
          startTime.setHours(0, 0, 0, 0)
          endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          endTime.setHours(23, 59, 59, 999)
        }
        
        const response = await getCompletedTasksByPeriod(
          this.$store.getters['user/userId'],
          this.formatDateTime(startTime),
          this.formatDateTime(endTime)
        )
        
        this.completedTasksList = response.data
        this.reportForm.completedTasks = JSON.stringify(response.data)
        this.$message.success(`已加载 ${response.data.length} 个已完成任务`)
      } catch (error) {
        this.$message.error('加载已完成任务失败')
        console.error(error)
      } finally {
        this.loadingTasks = false
      }
    },
    
    removeTask(taskId) {
      this.completedTasksList = this.completedTasksList.filter(task => task.id !== taskId)
      this.reportForm.completedTasks = JSON.stringify(this.completedTasksList)
    },
    
    async handleSubmit() {
      this.$refs.reportForm.validate(async (valid) => {
        if (!valid) return
        
        try {
          if (this.isEdit) {
            await updateReport(this.reportForm.id, this.reportForm)
            this.$message.success('报表更新成功')
          } else {
            await addReport(this.reportForm)
            this.$message.success('报表提交成功')
          }
          this.dialogVisible = false
          this.loadReports()
        } catch (error) {
          this.$message.error(this.isEdit ? '报表更新失败' : '报表提交失败')
          console.error(error)
        }
      })
    },
    
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    
    formatDateTime(date) {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      const seconds = String(d.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  },
  mounted() {
    this.loadReports()
  }
}
</script>

<style scoped>
.reports-container {
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

.content-card {
  margin: 0 24px 20px 24px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.filter-bar {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 0;
}

.search-form .el-form-item {
  margin-bottom: 16px;
}

.search-form .el-input__inner,
.search-form .el-select .el-input__inner,
.search-form .el-date-editor .el-input__inner {
  border-radius: 8px;
  border-color: #e2e8f0;
  transition: all 0.3s ease;
}

.search-form .el-date-editor {
  width: 400px;
}

.search-form .el-date-editor .el-range-input {
  width: 40%;
}

.search-form .el-input__inner:focus,
.search-form .el-select .el-input__inner:focus,
.search-form .el-date-editor .el-input__inner:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.action-bar {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.action-bar .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-bar .el-button--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
}

.action-bar .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

.el-table .el-button--text {
  padding: 6px 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.el-table .el-button--text:hover {
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

.completed-tasks-list {
  margin-top: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.report-detail {
  padding: 10px;
}

.detail-section {
  margin-top: 20px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1e293b;
}

.detail-section p {
  line-height: 1.6;
  color: #64748b;
  white-space: pre-wrap;
}

.tasks-list {
  display: flex;
  flex-wrap: wrap;
}

.el-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 2px 8px;
  font-size: 12px;
}

.dialog-footer {
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  text-align: right;
}

.dialog-footer .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.dialog-footer .el-button--primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
}

.dialog-footer .el-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}
</style>
