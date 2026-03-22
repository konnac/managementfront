<template>
  <div class="send-notification-container">
    <h2 class="page-title">发送通知</h2>
    
    <el-card class="form-card" shadow="hover">
      <el-form :model="notificationForm" :rules="rules" ref="notificationForm" label-width="120px">
        <el-form-item label="发送类型" prop="sendType">
          <el-radio-group v-model="notificationForm.sendType" @change="handleSendTypeChange">
            <el-radio label="admin" v-if="userInfo.role === 'ADMIN'">系统公告</el-radio>
            <el-radio label="manager" v-if="userInfo.role === 'ADMIN' || userInfo.role === 'PROJECT_MANAGER'">普通公告</el-radio>
            <el-radio label="project" v-if="userInfo.role === 'ADMIN' || userInfo.role === 'PROJECT_MANAGER'">项目成员通知</el-radio>
            <el-radio label="task" v-if="userInfo.role === 'ADMIN' || userInfo.role === 'PROJECT_MANAGER' || userInfo.role === 'EMPLOYEE'">任务成员通知</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="通知标题" prop="title">
          <el-input v-model="notificationForm.title" placeholder="请输入通知标题" maxlength="100" show-word-limit></el-input>
        </el-form-item>

        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="notificationForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>

        <el-form-item label="选择项目" prop="projectId" v-if="notificationForm.sendType === 'project' || notificationForm.sendType === 'task'">
          <el-select v-model="notificationForm.projectId" placeholder="请选择项目" @change="handleProjectChange" filterable>
            <el-option
              v-for="project in projectsList"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="选择任务" prop="taskId" v-if="notificationForm.sendType === 'task'">
          <el-select v-model="notificationForm.taskId" placeholder="请选择任务" filterable>
            <el-option
              v-for="task in tasksList"
              :key="task.id"
              :label="task.title"
              :value="task.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="接收用户" prop="userIds" v-if="notificationForm.sendType === 'manager' || notificationForm.sendType === 'admin'">
          <el-select
            v-model="notificationForm.userIds"
            multiple
            filterable
            placeholder="请选择接收用户（可多选）"
            style="width: 100%"
          >
            <el-option
              v-for="user in usersList"
              :key="user.id"
              :label="user.realName + ' (' + user.username + ')'"
              :value="user.id"
            ></el-option>
          </el-select>
          <div class="tip-text">
            <el-checkbox v-model="selectAllUsers" @change="handleSelectAllUsers">全选所有用户</el-checkbox>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">发送通知</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="info-card" shadow="hover">
      <h3>发送说明</h3>
      <ul>
        <li><strong>系统公告(管理员)</strong>：仅管理员可发送，可向任意用户发送系统级别的公告通知</li>
        <li><strong>普通公告(管理员/项目经理)</strong>：管理员和项目经理可发送，可向任意用户发送普通公告</li>
        <li><strong>项目成员通知</strong>：管理员和项目经理可发送，向指定项目的所有成员发送通知</li>
        <li><strong>任务成员通知</strong>：管理员和项目成员可发送，向指定任务的所有成员发送通知</li>
      </ul>
    </el-card>
  </div>
</template>

<script>
import { sendNorNotification, sendSysNotification, sendNotificationToProjectMembers, sendNotificationToTaskMembers } from '../api/notifications'
import { getProjects } from '../api/projects'
import { getTasks } from '../api/tasks'
import { getNotificationRecipients } from '../api/users'
import { mapGetters } from 'vuex'

export default {
  name: 'SendNotificationView',
  data() {
    return {
      notificationForm: {
        sendType: 'manager',
        title: '',
        content: '',
        type: 'ANNOUNCEMENT',
        relatedType: '',
        relatedId: null,
        projectId: null,
        taskId: null,
        userIds: []
      },
      rules: {
        sendType: [{ required: true, message: '请选择发送类型', trigger: 'change' }],
        title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
        projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
        taskId: [{ required: true, message: '请选择任务', trigger: 'change' }],
        userIds: [{ required: true, message: '请选择接收用户', trigger: 'change' }]
      },
      projectsList: [],
      tasksList: [],
      usersList: [],
      selectAllUsers: false,
      submitting: false
    }
  },
  computed: {
    ...mapGetters('user', ['userInfo']),
    currentUserId() {
      return this.userInfo ? this.userInfo.id : null
    }
  },
  mounted() {
    this.initDefaultSendType()
    this.loadProjects()
    this.loadUsers()
  },
  methods: {
    initDefaultSendType() {
      if (this.userInfo.role === 'ADMIN') {
        this.notificationForm.sendType = 'admin'
      } else if (this.userInfo.role === 'PROJECT_MANAGER') {
        this.notificationForm.sendType = 'project'
      } else if (this.userInfo.role === 'EMPLOYEE') {
        this.notificationForm.sendType = 'task'
      }
      
      if (this.notificationForm.sendType === 'admin') {
        this.notificationForm.type = 'SYSTEM_ANNOUNCEMENT'
      } else {
        this.notificationForm.type = 'ANNOUNCEMENT'
      }
    },
    handleSendTypeChange() {
      this.$refs.notificationForm.clearValidate()
      this.notificationForm.projectId = null
      this.notificationForm.taskId = null
      this.notificationForm.userIds = []
      this.tasksList = []
      
      if (this.notificationForm.sendType === 'admin') {
        this.notificationForm.type = 'SYSTEM_ANNOUNCEMENT'
      } else {
        this.notificationForm.type = 'ANNOUNCEMENT'
      }
    },
    handleProjectChange() {
      if (this.notificationForm.projectId) {
        this.loadTasks(this.notificationForm.projectId)
      }
    },
    handleSelectAllUsers(val) {
      if (val) {
        this.notificationForm.userIds = this.usersList.map(user => user.id)
      } else {
        this.notificationForm.userIds = []
      }
    },
    async loadProjects() {
      try {
        const response = await getProjects({ page: 1, pageSize: 1000 })
        this.projectsList = response.data.rows || []
      } catch (error) {
        this.$message.error('加载项目列表失败')
        console.error(error)
      }
    },
    async loadTasks(projectId) {
      try {
        const response = await getTasks(projectId, { page: 1, pageSize: 1000 })
        this.tasksList = response.data.rows || []
      } catch (error) {
        this.$message.error('加载任务列表失败')
        console.error(error)
      }
    },
    async loadUsers() {
      try {
        const response = await getNotificationRecipients()
        this.usersList = response.data || []
      } catch (error) {
        this.$message.error('加载用户列表失败')
        console.error(error)
      }
    },
    async handleSubmit() {
      this.$refs.notificationForm.validate(async (valid) => {
        if (!valid) {
          return false
        }

        this.submitting = true
        try {
          let relatedId = null
          let relatedType = null
          
          if (this.notificationForm.sendType === 'admin') {
            relatedId = 0
            relatedType = 'SYSTEM'
          } else if (this.notificationForm.sendType === 'manager') {
            relatedId = -1
            relatedType = 'COMMON'
          } else if (this.notificationForm.sendType === 'project') {
            relatedId = this.notificationForm.projectId
            relatedType = 'PROJECT'
          } else if (this.notificationForm.sendType === 'task') {
            relatedId = this.notificationForm.taskId
            relatedType = 'TASK'
          }

          const notification = {
            title: this.notificationForm.title,
            content: this.notificationForm.content,
            type: this.notificationForm.type,
            relatedType: relatedType,
            relatedId: relatedId
          }

          console.log('发送通知前的用户ID列表:', this.notificationForm.userIds)
          console.log('用户ID列表长度:', this.notificationForm.userIds.length)
          
          let response
          switch (this.notificationForm.sendType) {
            case 'admin':
              response = await sendSysNotification(this.notificationForm.userIds, notification)
              break
            case 'manager':
              response = await sendNorNotification(this.notificationForm.userIds, notification)
              break
            case 'project':
              response = await sendNotificationToProjectMembers(
                this.notificationForm.projectId,
                this.notificationForm.title,
                this.notificationForm.content,
                this.notificationForm.type
              )
              break
            case 'task':
              response = await sendNotificationToTaskMembers(
                this.notificationForm.projectId,
                this.notificationForm.taskId,
                this.notificationForm.title,
                this.notificationForm.content,
                this.notificationForm.type
              )
              break
          }

          if (response.code === 200 || response.code === 201) {
            const batchResult = response.data
            let message = response.message || '发送成功'
            
            if (batchResult && (batchResult.total !== undefined || batchResult.successCount !== undefined)) {
              const total = batchResult.total || 0
              const successCount = batchResult.successCount || 0
              const failureCount = batchResult.failureCount || 0
              
              if (total > 0) {
                if (failureCount === 0) {
                  message = `发送成功：共 ${total} 人，全部发送成功`
                } else if (successCount === 0) {
                  message = `发送失败：共 ${total} 人，全部发送失败`
                } else {
                  message = `部分发送成功：共 ${total} 人，成功 ${successCount} 人，失败 ${failureCount} 人`
                }
              }
            }
            
            this.$message.success(message)
            this.handleReset()
          } else {
            this.$message.error(response.message || '发送失败')
          }
        } catch (error) {
          this.$message.error('发送通知失败')
          console.error(error)
        } finally {
          this.submitting = false
        }
      })
    },
    handleReset() {
      this.$refs.notificationForm.resetFields()
      this.notificationForm.sendType = 'manager'
      this.notificationForm.type = 'ANNOUNCEMENT'
      this.notificationForm.userIds = []
      this.notificationForm.projectId = null
      this.notificationForm.taskId = null
      this.tasksList = []
      this.selectAllUsers = false
    }
  }
}
</script>

<style scoped>
.send-notification-container {
  padding: 0 20px;
  width: 100%;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.form-card {
  margin-bottom: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.info-card h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  line-height: 1.6;
}

.info-card li:last-child {
  border-bottom: none;
}

.tip-text {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}
</style>
