import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: '/users',
        name: 'users',
        component: () => import('../views/UsersView.vue')
      },
      {
        path: '/projects',
        name: 'projects',
        component: () => import('../views/ProjectsView.vue')
      },
      {
        path: '/projects/:id/members',
        name: 'projectMembers',
        component: () => import('../views/ProjectMembersView.vue')
      },
      {
        path: '/projects/:id/tasks',
        name: 'projectTasks',
        component: () => import('../views/ProjectTasksView.vue')
      },
      {
        path: '/projects/:id/documents',
        name: 'projectDocuments',
        component: () => import('../views/DocumentsView.vue')
      },
      {
        path: '/projects/:projectId/tasks/:taskId/members',
        name: 'taskMembers',
        component: () => import('../views/TaskMembersView.vue')
      },
      {
        path: '/tasks',
        name: 'tasks',
        component: () => import('../views/TasksView.vue')
      },
      {
        path: '/my-tasks',
        name: 'myTasks',
        component: () => import('../views/MyTasksView.vue')
      },
      {
        path: '/notifications',
        name: 'notifications',
        component: () => import('../views/NotificationsView.vue')
      },
      {
        path: '/notifications/send',
        name: 'sendNotification',
        component: () => import('../views/SendNotificationView.vue')
      },
      {
        path: '/reports',
        name: 'reports',
        component: () => import('../views/ReportsView.vue')
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.path === '/login') {
    next()
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
