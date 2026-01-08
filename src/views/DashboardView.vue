<template>
  <div class="dashboard-container" v-loading="loading" element-loading-text="数据加载中...">
    <h2 class="page-title">{{ isAdmin ? '总览' : '我的工作台' }}</h2>
    
    <!-- 统计卡片 -->
    <div class="stats-container">
      <el-card class="stat-card" shadow="hover" v-if="isAdmin">
        <div class="stat-content">
          <div class="stat-icon user-icon">
            <i class="el-icon-user"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon project-icon">
            <i class="el-icon-document-copy"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalProjects }}</div>
            <div class="stat-label">{{ isAdmin ? '总项目数' : '参与项目数' }}</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <div class="stat-content">
          <div class="stat-icon task-icon">
            <i class="el-icon-s-order"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalTasks }}</div>
            <div class="stat-label">{{ isAdmin ? '总任务数' : '我的任务数' }}</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover">
        <el-tooltip content="统计进行中和已延期的项目" placement="top">
          <div class="stat-content">
            <div class="stat-icon active-icon">
              <i class="el-icon-time"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.activeProjects }}</div>
              <div class="stat-label">{{ isAdmin ? '活跃项目' : '活跃项目数' }}</div>
            </div>
          </div>
        </el-tooltip>
      </el-card>
      
      <el-card class="stat-card" shadow="hover" v-if="!isAdmin">
        <div class="stat-content">
          <div class="stat-icon delay-icon">
            <i class="el-icon-warning"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.delayRate }}%</div>
            <div class="stat-label">延期率</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card" shadow="hover" v-if="!isAdmin">
        <div class="stat-content">
          <div class="stat-icon hour-icon">
            <i class="el-icon-timer"></i>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalHour }}</div>
            <div class="stat-label">总工时</div>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 近期项目 -->
      <el-card class="content-card" shadow="hover">
        <div slot="header" class="card-header">
          <h3>近期项目</h3>
          <el-button type="text" @click="moreProjects">查看更多</el-button>
        </div>
        <el-table :data="recentProjects" stripe border style="width: 100%">
          <el-table-column prop="name" label="项目名称" min-width="180" class-name="project-name-column">
            <template slot-scope="scope">
              <el-link type="primary" @click="handleViewProject(scope.row)" style="font-size: 15px; font-weight: 500; cursor: pointer;">{{ scope.row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column prop="managerName" label="项目经理" width="110"></el-table-column>
          <el-table-column prop="status" label="状态" width="95" class-name="status-column">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)" class="status-tag">{{ getStatusText(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startDate" label="开始日期" width="125"></el-table-column>
          <el-table-column label="(预计)结束日期" width="130">
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
        </el-table>
      </el-card>
      
      <!-- 任务状态统计 -->
      <el-card class="content-card" shadow="hover">
        <div slot="header" class="card-header">
          <h3>{{ isAdmin ? '任务状态统计' : '我的任务统计' }}</h3>
        </div>
        <div class="task-stats">
          <div class="task-stat-item" v-for="item in taskStats" :key="item.status">
            <div class="task-stat-progress">
              <el-progress :percentage="item.percentage" :stroke-width="20" :color="item.color"></el-progress>
            </div>
            <div class="task-stat-info">
              <div class="task-stat-name">{{ item.status }}</div>
              <div class="task-stat-count">{{ item.count }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getProjects } from '../api/projects'
import { getDashboardOverview, getUserDashboardOverview } from '../api/dashboard'

export default {
  name: 'DashboardView',
  computed: {
    ...mapGetters('user', ['userInfo', 'role', 'userId']),
    isAdmin() {
      return this.role === 'ADMIN'
    }
  },
  watch: {
    userInfo: {
      handler(newVal) {
        console.log('Dashboard: userInfo 发生变化', newVal)
        if (newVal && newVal.id) {
          console.log('Dashboard: 用户信息已加载，开始加载数据')
          this.loadData()
        }
      },
      immediate: true,
      deep: true
    }
  },
  data() {
    return {
      loading: false,
      stats: {
        totalUsers: 0,
        totalProjects: 0,
        totalTasks: 0,
        activeProjects: 0,
        delayRate: 0,
        totalHour: 0
      },
      recentProjects: [],
      taskStats: [
        {
          status: '未开始',
          count: 0,
          percentage: 0,
          color: '#909399'
        },
        {
          status: '进行中',
          count: 0,
          percentage: 0,
          color: '#409EFF'
        },
        {
          status: '已延期',
          count: 0,
          percentage: 0,
          color: '#E6A23C'
        },
        {
          status: '已完成',
          count: 0,
          percentage: 0,
          color: '#67C23A'
        },
        {
          status: '已取消',
          count: 0,
          percentage: 0,
          color: '#F56C6C'
        }
      ]
    }
  },
  methods: {
    moreProjects() {
      this.$router.push('/projects')
    },
    // 获取项目状态类型
    getStatusType(status) {
      const types = {
        IN_PROGRESS: 'success',
        COMPLETED: 'info',
        DELAYED: 'warning',
        TERMINATED: 'danger'
      }
      return types[status] || 'info'
    },
    getStatusText(status) {
      const texts = {
        IN_PROGRESS: '进行中',
        COMPLETED: '已完成',
        DELAYED: '已延期',
        TERMINATED: '已取消'
      }
      return texts[status] || status
    },
    handleViewProject(project) {
      this.$router.push({ name: 'projectMembers', params: { id: project.id } })
    },
    async loadData() {
      this.loading = true
      try {
        console.log('Dashboard: 开始加载数据')
        console.log('Dashboard: 用户信息', this.userInfo)
        console.log('Dashboard: 用户ID', this.userId)
        console.log('Dashboard: 用户角色', this.role)
        console.log('Dashboard: 是否管理员', this.isAdmin)
        
        if (!this.userId) {
          console.error('Dashboard: 用户ID为空，无法加载数据')
          this.$message.error('用户信息加载失败，请重新登录')
          this.loading = false
          return
        }
        
        if (this.isAdmin) {
          await this.loadAdminData()
        } else {
          await this.loadUserData()
        }
        
        console.log('Dashboard: 数据加载完成')
      } catch (error) {
        console.error('加载仪表盘数据失败:', error)
        this.$message.error('加载数据失败，请稍后重试')
      } finally {
        this.loading = false
      }
    },
    async loadAdminData() {
      console.log('Dashboard: 开始加载管理员数据')
      
      const overviewResponse = await getDashboardOverview()
      console.log('Dashboard: 总览数据', overviewResponse.data)
      
      const overview = overviewResponse.data
      
      this.stats.totalUsers = overview.totalUsers
      this.stats.totalProjects = overview.totalProjects
      this.stats.totalTasks = overview.totalTasks
      
      const projectsResponse = await getProjects({ page: 1, pageSize: 1000, sortBy: 'id', sortOrder: 'desc' })
      const allProjects = projectsResponse.data.rows
      
      this.recentProjects = allProjects.slice(0, 5).map(project => ({
        ...project,
        managerName: project.managerName || ''
      }))
      this.stats.activeProjects = allProjects.filter(project => project.status === 'IN_PROGRESS' || project.status === 'DELAYED').length
      
      const taskStats = overview.taskStats
      
      this.taskStats[0].count = taskStats.notStarted
      this.taskStats[1].count = taskStats.inProgress
      this.taskStats[2].count = taskStats.pending
      this.taskStats[3].count = taskStats.completed
      this.taskStats[4].count = taskStats.cancelled
      
      this.taskStats.forEach(item => {
        item.percentage = this.stats.totalTasks > 0 ? Math.round((item.count / this.stats.totalTasks) * 100) : 0
      })
      
      console.log('Dashboard: 管理员数据加载完成', this.stats)
    },
    async loadUserData() {
      console.log('Dashboard: 开始加载普通用户数据')
      
      const overviewResponse = await getUserDashboardOverview()
      console.log('Dashboard: 用户总览数据', overviewResponse.data)
      
      const overview = overviewResponse.data
      
      this.stats.totalProjects = overview.totalProjects
      this.stats.totalTasks = overview.totalTasks
      this.stats.activeProjects = overview.activeProjects
      this.stats.delayRate = overview.taskStats.delayRate.toFixed(2)
      this.stats.totalHour = overview.taskStats.totalHour
      
      const projectsResponse = await getProjects({ page: 1, pageSize: 5 })
      const userProjects = projectsResponse.data.rows
      
      this.recentProjects = userProjects.map(project => ({
        ...project,
        managerName: project.managerName || ''
      }))
      
      const taskStats = overview.taskStats
      
      this.taskStats[0].count = taskStats.notStarted
      this.taskStats[1].count = taskStats.inProgress
      this.taskStats[2].count = taskStats.delay
      this.taskStats[3].count = taskStats.completed
      this.taskStats[4].count = taskStats.cancelled
      
      this.taskStats.forEach(item => {
        item.percentage = this.stats.totalTasks > 0 ? Math.round((item.count / this.stats.totalTasks) * 100) : 0
      })
      
      console.log('Dashboard: 普通用户数据加载完成', this.stats)
    }
  },
  mounted() {
    console.log('Dashboard: 组件已挂载')
    console.log('Dashboard: userInfo', this.userInfo)
    console.log('Dashboard: role', this.role)
    console.log('Dashboard: userId', this.userId)
    console.log('Dashboard: isAdmin', this.isAdmin)
    console.log('Dashboard: localStorage userInfo', localStorage.getItem('userInfo'))
    console.log('Dashboard: localStorage token', localStorage.getItem('token'))
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 0;
  width: 100%;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 24px 24px 24px 24px;
  color: #1e293b;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title::before {
  content: '';
  width: 4px;
  height: 28px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 6px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin: 0 24px 24px 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.stat-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.user-icon {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.project-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.task-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.active-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.delay-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.hour-icon {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.content-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin: 0 24px 24px 24px;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border-radius: 6px;
}

.task-stats {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px 24px;
}

.task-stat-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.task-stat-progress {
  flex: 1;
}

.task-stat-info {
  min-width: 100px;
  text-align: right;
}

.task-stat-name {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
  font-weight: 500;
}

.task-stat-count {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

::v-deep .project-name-column .cell {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

::v-deep .status-tag {
  padding: 2px 8px;
  font-size: 12px;
  height: 24px;
  line-height: 20px;
}
</style>