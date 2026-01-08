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
