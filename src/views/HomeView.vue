<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarCollapse ? '64px' : '200px'" :class="['sidebar-container', { collapsed: sidebarCollapse }]">
      <div class="logo-container">
        <i class="el-icon-s-home logo-icon" :class="{ 'show': sidebarCollapse }"></i>
        <img src="../assets/logo.svg" alt="Logo" class="logo-image" :class="{ 'show': !sidebarCollapse }" />
        <span class="logo-text" :class="{ 'show': !sidebarCollapse }">部门级管理</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="sidebarCollapse"
        collapse-transition
        class="el-menu-vertical-demo"
        background-color="#2c3e50"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
      >
        <el-menu-item index="/dashboard">
          <i class="el-icon-s-data"></i>
          <span slot="title">总览</span>
        </el-menu-item>
        <el-menu-item index="/users" v-if="userInfo.role === 'ADMIN'">
          <i class="el-icon-user"></i>
          <span slot="title">用户管理</span>
        </el-menu-item>
        <el-menu-item index="/projects">
          <i class="el-icon-document-copy"></i>
          <span slot="title">项目管理</span>
        </el-menu-item>
        <el-menu-item index="/my-tasks">
          <i class="el-icon-s-claim"></i>
          <span slot="title">{{ isAdmin ? '任务管理' : '我的任务' }}</span>
        </el-menu-item>
        <el-submenu index="notifications-menu">
          <template slot="title">
            <el-badge v-if="unreadCount > 0" :value="unreadCount" :max="99" class="notification-badge">
              <i class="el-icon-bell"></i>
            </el-badge>
            <i v-else class="el-icon-bell"></i>
            <span>通知管理</span>
          </template>
          <el-menu-item index="/notifications">
            <i class="el-icon-message"></i>
            <span slot="title">通知列表</span>
          </el-menu-item>
          <el-menu-item index="/notifications/send" v-if="userInfo.role === 'ADMIN' || userInfo.role === 'PROJECT_MANAGER' || userInfo.role === 'EMPLOYEE'">
            <i class="el-icon-s-promotion"></i>
            <span slot="title">发送通知</span>
          </el-menu-item>
        </el-submenu>
        <el-menu-item index="/reports">
          <i class="el-icon-document"></i>
          <span slot="title">{{ isAdmin ? '报表管理' : '我的报表' }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header-container">
        <div class="header-left">
          <el-button type="text" @click="toggleSidebar" class="menu-button">
            <i class="el-icon-menu"></i>
          </el-button>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <i class="el-icon-user"></i>
              <span>{{ username }}</span>
              <i class="el-icon-arrow-down"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main-container">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { getUnreadCount } from '../api/notifications'

export default {
  name: 'HomeView',
  data() {
    return {
      activeMenu: '',
      sidebarCollapse: false,
      unreadCount: 0
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.userInfo || { realName: '管理员' }
    },
    username() {
      return this.userInfo.realName || '管理员'
    },
    currentUserId() {
      return this.userInfo ? this.userInfo.id : null
    },
    isAdmin() {
      return this.userInfo !== null && this.userInfo.role === 'ADMIN'
    }
  },
  mounted() {
    this.updateActiveMenu()
    this.loadUnreadCount()
    this.$router.afterEach(() => {
      this.updateActiveMenu()
    })
    this.$watch('$route', () => {
      this.loadUnreadCount()
    })
  },
  methods: {
    updateActiveMenu() {
      this.activeMenu = this.$route.path
    },
    toggleSidebar() {
      this.sidebarCollapse = !this.sidebarCollapse
    },
    async loadUnreadCount() {
      if (!this.currentUserId) return
      try {
        const response = await getUnreadCount(this.currentUserId)
        this.unreadCount = response.data || 0
      } catch (error) {
        console.error('获取未读通知数量失败:', error)
      }
    },
    handleCommand(command) {
      console.log('Command:', command)
      if (command === 'profile') {
        this.$router.push('/profile')
      } else if (command === 'logout') {
        this.$confirm('确定要退出登录吗？', '退出确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          console.log('User confirmed logout')
          this.$store.dispatch('user/logout')
          this.$router.push('/login')
        }).catch(() => {
          console.log('User cancelled logout')
        })
      }
    }
  }
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

.notification-badge {
  position: relative;
  display: inline-block;
}

.notification-badge ::v-deep .el-badge__content {
  position: absolute;
  top: -5px;
  right: 5px;
  transform: translateY(0) translateX(0);
}

.sidebar-container.collapsed .notification-badge ::v-deep .el-badge__content {
  right: 5px;
}

.sidebar-container {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  height: 100%;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.logo-container {
  padding: 20px 20px 20px 15px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: 100%;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 70px;
  box-sizing: border-box;
}

.logo-text {
  color: #fff;
  margin: 0;
  font-size: 16px;
  opacity: 1;
  transform: translateX(0) scale(1);
  visibility: visible;
  display: block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
  flex-shrink: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.logo-text.show {
  opacity: 1;
  transform: translateX(0) scale(1);
  visibility: visible;
}

.logo-icon {
  color: #fff;
  font-size: 24px;
  opacity: 0;
  transform: translateX(0) scale(0.9);
  visibility: hidden;
  display: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
  flex-shrink: 0;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.logo-text.show,
.logo-icon.show {
  opacity: 1;
  transform: translateX(0) scale(1);
  visibility: visible;
}

.logo-icon.show {
  display: block;
}

.sidebar-container {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.el-menu {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-right: none !important;
  background: transparent !important;
}

.el-menu-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  white-space: nowrap;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  margin: 4px 12px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7) !important;
}

.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  transform: translateX(4px);
}

.el-menu-item.is-active {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.el-menu-item i {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 20px;
  flex-shrink: 0;
}

.el-menu-item .el-icon + span {
  margin-left: 12px;
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
  flex-shrink: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  position: relative;
  font-weight: 500;
}

.sidebar-container.collapsed .el-menu-item {
  justify-content: flex-start;
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin: 4px 8px;
}

.sidebar-container.collapsed .el-menu-item i {
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
}

.sidebar-container.collapsed .el-menu-item ::v-deep .el-icon {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.sidebar-container.collapsed .el-menu-item .el-icon + span {
  margin-left: 0 !important;
}

.sidebar-container.collapsed .el-menu-item span {
  opacity: 0;
  transform: translateX(-5px) scale(0.98);
  width: 0;
  margin-left: 0;
  overflow: hidden;
}

.sidebar-container:not(.collapsed) .el-menu-item span {
  opacity: 1;
  transform: translateX(0) scale(1);
  width: auto;
  margin-left: 12px;
  overflow: hidden;
}

.logo-image {
  height: 40px;
  vertical-align: middle;
  opacity: 1;
  transform: translateX(0) scale(1);
  visibility: visible;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) 0.05s;
  flex-shrink: 0;
}

.logo-image.show {
  opacity: 1;
  transform: translateX(0) scale(1);
  visibility: visible;
}

.sidebar-container:not(.collapsed) .logo-text {
  transform: translateX(0) scale(1);
  opacity: 1;
}

.sidebar-container.collapsed .logo-container i {
  transform: translateY(-50%) scale(1);
  font-size: 20px;
  position: absolute;
  left: 22px;
  top: 50%;
  width: 20px;
  height: 20px;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.sidebar-container.collapsed .logo-container {
  padding: 0;
  height: 56px;
  position: relative;
  overflow: hidden;
  justify-content: center;
}

.sidebar-container.collapsed .logo-image {
  height: 32px;
}

.sidebar-container.collapsed .logo-text {
  opacity: 0;
  transform: translateX(-10px);
  visibility: hidden;
  width: 0;
}

.el-submenu {
  margin: 4px 12px;
  border-radius: 10px;
  overflow: hidden;
}

.sidebar-container.collapsed .el-submenu {
  margin: 4px 8px;
}

.sidebar-container.collapsed .el-submenu__title {
  justify-content: flex-start;
  padding: 0 !important;
}

.sidebar-container.collapsed .el-submenu__title i {
  margin-left: 0;
  margin-right: 0;
}

.sidebar-container.collapsed .el-submenu__title span {
  display: none;
}

.sidebar-container.collapsed .el-submenu__title .el-submenu__icon-arrow {
  display: none;
}

.el-submenu__title {
  color: rgba(255, 255, 255, 0.7) !important;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.el-submenu__title span {
  color: rgba(255, 255, 255, 0.7) !important;
}

.el-submenu__title:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  color: #fff !important;
  transform: translateX(4px);
}

.el-submenu__title:hover span {
  color: #fff !important;
}

.el-submenu.is-active > .el-submenu__title {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
  color: #fff !important;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.el-submenu.is-active > .el-submenu__title span {
  color: #fff !important;
}

.el-submenu .el-menu {
  background: rgba(0, 0, 0, 0.2) !important;
  margin: 4px 0;
  padding: 8px 0;
  border-radius: 8px;
}

.el-submenu .el-menu-item {
  margin: 2px 8px;
  padding-left: 20px !important;
  font-size: 14px;
}

* {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform-style: preserve-3d;
  transform-style: preserve-3d;
}

.header-container {
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
}

.menu-button {
  color: #64748b;
  font-size: 20px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.menu-button:hover {
  background-color: #f1f5f9;
  color: #4f46e5;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.user-info:hover {
  background-color: #f1f5f9;
  color: #4f46e5;
}

.user-info i {
  margin: 0 6px;
  font-size: 18px;
}

.main-container {
  padding: 0;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}
</style>
