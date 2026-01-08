import request from './axios'

// 获取总览数据（管理员）
export function getDashboardOverview() {
  return request({
    url: '/dashboard',
    method: 'get'
  })
}

// 获取用户总览数据（普通用户）
export function getUserDashboardOverview() {
  return request({
    url: '/dashboard/user',
    method: 'get'
  })
}
