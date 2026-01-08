<template>
  <div class="notifications-container">
    <h2 class="page-title">通知管理</h2>
    
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="通知标题">
          <el-input v-model="searchForm.title" placeholder="请输入通知标题" clearable></el-input>
        </el-form-item>
        <el-form-item label="通知类型">
          <el-select v-model="searchForm.type" placeholder="请选择通知类型" clearable>
            <el-option label="项目成员添加" value="PROJECT_MEMBER_ADDED"></el-option>
            <el-option label="项目成员移除" value="PROJECT_MEMBER_REMOVED"></el-option>
            <el-option label="项目成员角色变更" value="PROJECT_MEMBER_ROLE_CHANGED"></el-option>
            <el-option label="任务成员角色变更" value="TASK_MEMBER_ROLE_CHANGED"></el-option>
            <el-option label="项目创建" value="PROJECT_CREATED"></el-option>
            <el-option label="任务分配" value="TASK_ASSIGNED"></el-option>
            <el-option label="任务完成" value="TASK_COMPLETED"></el-option>
            <el-option label="任务成员移除" value="TASK_MEMBER_REMOVED"></el-option>
            <el-option label="任务即将到期" value="TASK_DUE_SOON"></el-option>
            <el-option label="普通通知" value="ANNOUNCEMENT"></el-option>
            <el-option label="系统通知" value="SYSTEM_ANNOUNCEMENT"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否已读">
          <el-select v-model="searchForm.isRead" placeholder="请选择" clearable>
            <el-option label="未读" :value="false"></el-option>
            <el-option label="已读" :value="true"></el-option>
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
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="success" @click="handleMarkAllRead" :disabled="unreadCount === 0">全部已读</el-button>
        <el-button type="warning" @click="handleDeleteRead" :disabled="hasReadNotifications === 0">删除已读</el-button>
        <el-button type="danger" :disabled="selectedNotifications.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
    </el-card>
    
    <el-card class="table-card" shadow="hover">
      <el-table :data="notificationsList" stripe border @selection-change="handleSelectionChange" style="width: 100%">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="通知ID" width="80" align="center">
          <template slot="header">
            <div>通知<br>ID</div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="通知标题" width="250">
          <template slot-scope="scope">
            <span class="title-link" @click="handleViewDetail(scope.row)">{{ scope.row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="通知内容" show-overflow-tooltip></el-table-column>
        <el-table-column prop="type" label="通知类型" width="150" align="center">
          <template slot-scope="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ getTypeText(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isRead" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.isRead ? 'info' : 'danger'">
              {{ scope.row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 5px;">
              <el-button type="primary" size="small" @click="handleMarkRead(scope.row)" v-if="!scope.row.isRead" class="action-btn">标记已读</el-button>
              <el-button type="danger" size="small" @click="handleDeleteNotification(scope.row.id)" class="action-btn">删除</el-button>
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

    <el-dialog
      title="通知详情"
      :visible.sync="detailDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      :modal="false"
    >
      <div v-if="currentNotification" class="notification-detail">
        <div class="detail-item">
          <span class="detail-label">通知标题：</span>
          <span class="detail-value">{{ currentNotification.title }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">通知类型：</span>
          <el-tag :type="getTypeTagType(currentNotification.type)">
            {{ getTypeText(currentNotification.type) }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态：</span>
          <el-tag :type="currentNotification.isRead ? 'info' : 'danger'">
            {{ currentNotification.isRead ? '已读' : '未读' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间：</span>
          <span class="detail-value">{{ formatDate(currentNotification.createdAt) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">通知内容：</span>
        </div>
        <div class="detail-content">
          {{ currentNotification.content }}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" v-if="currentNotification && !currentNotification.isRead" @click="handleMarkReadFromDialog">标记已读</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getNotifications, markAsRead, markAllAsRead, deleteBatchNotifications, deleteAllReadNotifications, getNotificationDetail } from '../api/notifications'
import { mapGetters } from 'vuex'

export default {
  name: 'NotificationsView',
  data() {
    return {
      searchForm: {
        title: '',
        type: '',
        isRead: null,
        begin: '',
        end: ''
      },
      dateRange: [],
      notificationsList: [],
      selectedNotifications: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      unreadCount: 0,
      hasReadNotifications: 0,
      detailDialogVisible: false,
      currentNotification: null
    }
  },
  computed: {
    ...mapGetters('user', ['userId']),
    currentUserId() {
      return this.userId
    }
  },
  methods: {
    getTypeTagType(type) {
      const types = {
        PROJECT_MEMBER_ADDED: 'success',
        PROJECT_MEMBER_REMOVED: 'warning',
        PROJECT_MEMBER_ROLE_CHANGED: 'primary',
        TASK_MEMBER_ROLE_CHANGED: 'primary',
        PROJECT_CREATED: 'success',
        TASK_ASSIGNED: 'primary',
        TASK_COMPLETED: 'success',
        TASK_MEMBER_REMOVED: 'warning',
        TASK_DUE_SOON: 'danger',
        ANNOUNCEMENT: 'info',
        SYSTEM_ANNOUNCEMENT: 'danger'
      }
      return types[type] || 'info'
    },
    getTypeText(type) {
      const texts = {
        PROJECT_MEMBER_ADDED: '项目成员添加',
        PROJECT_MEMBER_REMOVED: '项目成员移除',
        PROJECT_MEMBER_ROLE_CHANGED: '项目成员角色变更',
        TASK_MEMBER_ROLE_CHANGED: '任务成员角色变更',
        PROJECT_CREATED: '项目创建',
        TASK_ASSIGNED: '任务分配',
        TASK_COMPLETED: '任务完成',
        TASK_MEMBER_REMOVED: '任务成员移除',
        TASK_DUE_SOON: '任务即将到期',
        ANNOUNCEMENT: '普通通知',
        SYSTEM_ANNOUNCEMENT: '系统通知'
      }
      return texts[type] || type
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    async loadNotifications() {
      if (!this.currentUserId) {
        this.$message.warning('请先登录')
        return
      }
      try {
        const params = {
          ...this.searchForm,
          userId: this.currentUserId,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        const response = await getNotifications(params)
        this.notificationsList = response.data.rows
        this.pagination.total = response.data.total
        
        this.unreadCount = this.notificationsList.filter(n => !n.isRead).length
        
        try {
          const readParams = {
            userId: this.currentUserId,
            isRead: true,
            page: 1,
            pageSize: 1
          }
          const readResponse = await getNotifications(readParams)
          this.hasReadNotifications = readResponse.data.total
        } catch (error) {
          console.error('获取已读通知数量失败', error)
          this.hasReadNotifications = this.notificationsList.filter(n => n.isRead).length
        }
      } catch (error) {
        this.$message.error('加载通知列表失败')
        console.error(error)
      }
    },
    handleSearch() {
      if (this.dateRange && this.dateRange.length === 2) {
        this.searchForm.begin = this.dateRange[0]
        this.searchForm.end = this.dateRange[1]
      } else {
        this.searchForm.begin = ''
        this.searchForm.end = ''
      }
      this.pagination.page = 1
      this.loadNotifications()
    },
    handleReset() {
      this.searchForm = {
        title: '',
        type: '',
        isRead: null,
        begin: '',
        end: ''
      }
      this.dateRange = []
      this.pagination.page = 1
      this.loadNotifications()
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.page = 1
      this.loadNotifications()
    },
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadNotifications()
    },
    handleSelectionChange(selection) {
      this.selectedNotifications = selection
    },
    async handleMarkRead(notification) {
      try {
        await markAsRead(notification.id, this.currentUserId)
        this.$message.success('标记已读成功')
        this.loadNotifications()
      } catch (error) {
        this.$message.error('标记已读失败')
        console.error(error)
      }
    },
    async handleMarkAllRead() {
      try {
        await markAllAsRead(this.currentUserId)
        this.$message.success('全部已读成功')
        this.loadNotifications()
      } catch (error) {
        this.$message.error('全部已读失败')
        console.error(error)
      }
    },
    async handleDeleteNotification(id) {
      this.$confirm('确定要删除该通知吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteBatchNotifications([id], this.currentUserId)
          this.$message.success('通知删除成功')
          this.loadNotifications()
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {
      })
    },
    async handleBatchDelete() {
      if (this.selectedNotifications.length === 0) {
        this.$message.warning('请选择要删除的通知')
        return
      }
      
      this.$confirm('确定要批量删除选中的通知吗？', '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedNotifications.map(n => n.id)
          await deleteBatchNotifications(ids, this.currentUserId)
          this.$message.success('批量删除成功')
          this.selectedNotifications = []
          this.loadNotifications()
        } catch (error) {
          this.$message.error('批量删除失败')
          console.error(error)
        }
      }).catch(() => {
      })
    },
    async handleDeleteRead() {
      this.$confirm('确定要删除所有已读通知吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteAllReadNotifications(this.currentUserId)
          this.$message.success('删除已读通知成功')
          this.loadNotifications()
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {
      })
    },
    async handleViewDetail(notification) {
      try {
        const response = await getNotificationDetail(notification.id)
        this.currentNotification = response.data
        this.detailDialogVisible = true
      } catch (error) {
        this.$message.error('获取通知详情失败')
        console.error(error)
      }
    },
    async handleMarkReadFromDialog() {
      if (this.currentNotification) {
        try {
          await markAsRead(this.currentNotification.id, this.currentUserId)
          this.$message.success('标记已读成功')
          this.currentNotification.isRead = true
          this.loadNotifications()
        } catch (error) {
          this.$message.error('标记已读失败')
          console.error(error)
        }
      }
    }
  },
  mounted() {
    console.log('NotificationsView mounted - userId:', this.userId)
    console.log('NotificationsView mounted - currentUserId:', this.currentUserId)
    console.log('NotificationsView mounted - userInfo:', this.$store.getters.userInfo)
    this.loadNotifications()
  }
}
</script>

<style scoped>
.notifications-container {
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
.search-form .el-select .el-input__inner,
.search-form .el-date-editor .el-input__inner {
  border-radius: 8px;
  border-color: #e2e8f0;
  transition: all 0.3s ease;
}

.search-form .el-input__inner:focus,
.search-form .el-select .el-input__inner:focus,
.search-form .el-date-editor .el-input__inner:focus {
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

.action-buttons .el-button--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border: none;
}

.action-buttons .el-button--warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
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

.el-tag {
  border-radius: 6px;
  font-weight: 500;
  padding: 2px 8px;
}

.title-link {
  color: #4f46e5;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.title-link:hover {
  color: #7c3aed;
  text-decoration: underline;
}

.action-btn {
  padding: 6px 12px;
}

.notification-detail {
  padding: 8px 0;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.detail-label {
  font-weight: 600;
  color: #475569;
  min-width: 100px;
}

.detail-value {
  color: #1e293b;
}

.detail-content {
  margin-top: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  color: #1e293b;
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}
</style>
