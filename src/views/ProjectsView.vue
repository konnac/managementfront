<template>
  <div class="projects-container" v-loading="loading" element-loading-text="数据加载中...">
    <h2 class="page-title">项目管理</h2>
    
    <!-- 搜索和操作区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="项目ID">
          <el-input v-model.number="searchForm.id" placeholder="请输入项目ID" style="width: 120px;"></el-input>
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="searchForm.name" placeholder="请输入项目名称"></el-input>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="请选择优先级">
            <el-option label="高" value="HIGH"></el-option>
            <el-option label="中" value="MEDIUM"></el-option>
            <el-option label="低" value="LOW"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态">
            <el-option label="进行中" value="IN_PROGRESS"></el-option>
            <el-option label="已完成" value="COMPLETED"></el-option>
            <el-option label="已延期" value="DELAYED"></el-option>
            <el-option label="已取消" value="TERMINATED"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button type="success" @click="handleAddProject" v-if="canManageProjects">添加项目</el-button>
        <el-button type="danger" :disabled="selectedProjects.length === 0" @click="handleBatchDelete" v-if="canManageProjects">批量删除</el-button>
      </div>
    </el-card>
    
    <!-- 项目列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table :data="projectsList" stripe border @selection-change="handleSelectionChange" style="width: 100%">
        <el-table-column type="selection" width="55" v-if="canManageProjects"></el-table-column>
        <el-table-column prop="id" label="项目ID" width="70" align="center"></el-table-column>
        <el-table-column prop="name" label="项目名称" width="180">
          <template slot-scope="scope">
            <el-link type="primary" @click="handleViewMembers(scope.row)" style="font-size: 15px; font-weight: 500;">{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="项目描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="managerName" label="项目经理" width="150"></el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getPriorityType(scope.row.priority)" size="small">
              {{ getPriorityText(scope.row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="130" align="center"></el-table-column>
        <el-table-column label="(预计)结束日期" width="150" align="center">
          <template slot="header">
            <span>(预计)结束日期</span>
            <el-tooltip content="项目创建时设定的预期完成日期" placement="top">
              <i class="el-icon-info" style="margin-left: 4px; color: #909399; cursor: help;"></i>
            </el-tooltip>
          </template>
          <template slot-scope="scope">
            <span>{{ scope.row.endDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button type="success" size="small" @click="handleEditProject(scope.row)" v-if="canManageProjects">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDeleteProject(scope.row.id)" v-if="canManageProjects">删除</el-button>
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
    
    <!-- 添加/编辑项目对话框 -->
    <project-form-modal
      :visible.sync="dialogVisible"
      :title="dialogTitle"
      :project="projectForm"
      :project-managers="usersList"
      :show-manager-select="role === 'ADMIN' || !!projectForm.id"
      :is-edit="isEdit"
      @confirm="handleSaveProject"
    ></project-form-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjects, addProject, deleteProject, updateProject } from '../api/projects'
import { getProjectManagers } from '../api/users'
import ProjectFormModal from '../components/ProjectFormModal.vue'

export default {
  name: 'ProjectsView',
  components: {
    ProjectFormModal
  },
  computed: {
    ...mapGetters('user', ['role', 'userInfo']),
    canManageProjects() {
      return this.role === 'ADMIN' || this.role === 'PROJECT_MANAGER'
    }
  },
  data() {
    return {
      loading: false,
      searchForm: {
        id: null,
        name: '',
        priority: '',
        status: ''
      },
      projectsList: [],
      usersList: [],
      selectedProjects: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '添加项目',
      isEdit: false,
      projectForm: {
        id: null,
        name: '',
        description: '',
        managerId: null,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        startDate: null,
        endDate: null
      }
    }
  },
  methods: {
    // 获取优先级类型
    getPriorityType(priority) {
      const types = {
        HIGH: 'danger',
        MEDIUM: 'warning',
        LOW: 'success'
      }
      return types[priority] || 'info'
    },
    // 获取优先级文本
    getPriorityText(priority) {
      const texts = {
        HIGH: '高',
        MEDIUM: '中',
        LOW: '低'
      }
      return texts[priority] || priority
    },
    // 获取状态类型
    getStatusType(status) {
      const types = {
        IN_PROGRESS: 'success',
        COMPLETED: 'info',
        DELAYED: 'warning',
        TERMINATED: 'danger'
      }
      return types[status] || 'info'
    },
    // 获取状态文本
    getStatusText(status) {
      const texts = {
        IN_PROGRESS: '进行中',
        COMPLETED: '已完成',
        DELAYED: '已延期',
        TERMINATED: '已取消'
      }
      return texts[status] || status
    },
    // 加载项目列表
    async loadProjects() {
      try {
        const params = {
          ...this.searchForm,
          page: this.pagination.page,
          pageSize: this.pagination.pageSize,
          currentUserId: 1 // 这里应该从登录用户信息中获取
        }
        const response = await getProjects(params)
        this.projectsList = response.data.rows
        this.pagination.total = response.data.total
      } catch (error) {
        this.$message.error('加载项目列表失败')
        console.error(error)
      }
    },
    // 加载用户列表（用于选择项目经理）
    async loadUsers() {
      try {
        const response = await getProjectManagers()
        this.usersList = response.data
      } catch (error) {
        this.$message.error('加载用户列表失败')
        console.error(error)
      }
    },
    // 搜索项目
    handleSearch() {
      this.pagination.page = 1
      this.loadProjects()
    },
    // 重置搜索
    handleReset() {
      this.searchForm = {
        id: null,
        name: '',
        priority: '',
        status: ''
      }
      this.pagination.page = 1
      this.loadProjects()
    },
    // 分页大小改变
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.page = 1
      this.loadProjects()
    },
    // 当前页码改变
    handleCurrentChange(page) {
      this.pagination.page = page
      this.loadProjects()
    },
    // 选择项目
    handleSelectionChange(selection) {
      this.selectedProjects = selection
    },
    // 添加项目
    handleAddProject() {
      this.dialogTitle = '添加项目'
      this.isEdit = false
      this.projectForm = {
        id: null,
        name: '',
        description: '',
        managerId: null,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        startDate: null,
        endDate: null
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.projectForm.clearValidate()
      })
    },
    // 编辑项目
    handleEditProject(project) {
      this.dialogTitle = '编辑项目'
      this.isEdit = true
      this.projectForm = { ...project }
      this.dialogVisible = true
    },
    // 保存项目
    async handleSaveProject(formData) {
      try {
        if (formData.id) {
          await updateProject(formData, 1)
          this.$message.success('项目更新成功')
        } else {
          await addProject(formData)
          this.$message.success('项目添加成功')
        }
        this.loadProjects()
      } catch (error) {
        this.$message.error('操作失败')
        console.error(error)
      }
    },
    // 删除项目
    async handleDeleteProject(id) {
      this.$confirm('确定要删除该项目吗？', '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteProject([id], 1) // 操作人ID应该从登录用户信息中获取
          this.$message.success('项目删除成功')
          this.loadProjects()
        } catch (error) {
          this.$message.error('删除失败')
          console.error(error)
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    // 批量删除项目
    async handleBatchDelete() {
      if (this.selectedProjects.length === 0) {
        this.$message.warning('请选择要删除的项目')
        return
      }
      
      this.$confirm('确定要批量删除选中的项目吗？', '批量删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const ids = this.selectedProjects.map(project => project.id)
          await deleteProject(ids, 1) // 操作人ID应该从登录用户信息中获取
          this.$message.success('批量删除成功')
          this.selectedProjects = []
          this.loadProjects()
        } catch (error) {
          this.$message.error('批量删除失败')
          console.error(error)
        }
      }).catch(() => {
        // 用户取消操作
      })
    },
    // 查看项目成员
    handleViewMembers(project) {
      this.$router.push({ name: 'projectMembers', params: { id: project.id } })
    }
  },
    async mounted() {
      this.loading = true
      try {
        await Promise.all([this.loadUsers(), this.loadProjects()])
      } finally {
        this.loading = false
      }
    }
}
</script>

<style scoped>
.projects-container {
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

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
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
  margin: 24px 24px 24px 24px;
}
</style>