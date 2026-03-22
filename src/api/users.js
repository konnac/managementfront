import request from './axios'

// 获取用户列表
export function getUsers(params) {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

// 添加用户
export function addUser(data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

// 删除用户
export function deleteUser(ids) {
  return request({
    url: `/users/${ids}`,
    method: 'delete'
  })
}

// 更新用户(管理员)
export function updateUserAdmin(data) {
  return request({
    url: '/users/admin/' + data.id,
    method: 'put',
    data
  })
}

// 更新用户(普通用户)
export function updateUser(data) {
  return request({
    url: '/users/' + data.id,
    method: 'put',
    data
  })
}

// 检查用户名是否存在
export function checkUsername(username, excludeId) {
  return request({
    url: '/users/check-username',
    method: 'get',
    params: { username, excludeId }
  })
}

// 修改密码
export function changePassword(data) {
  return request({
    url: '/users/change-password',
    method: 'put',
    data
  })
}

// 获取项目经理列表
export function getProjectManagers() {
  return request({
    url: '/users/project-managers',
    method: 'get'
  })
}

// 获取可用用户列表（用于项目成员选择）
export function getAvailableUsers() {
  return request({
    url: '/users/available-users',
    method: 'get'
  })
}

// 获取通知接收人列表
export function getNotificationRecipients() {
  return request({
    url: '/users/notification-recipients',
    method: 'get'
  })
}
