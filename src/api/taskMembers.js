import request from './axios'

// 获取任务成员列表
export function getTaskMembers(projectId, taskId, params) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/members/${taskId}/assignable`,
    method: 'get',
    params
  })
}

// 添加任务成员
export function addTaskMember(projectId, taskId, data) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/members`,
    method: 'post',
    data
  })
}

// 批量添加任务成员
export function addTaskMembers(projectId, taskId, userIds) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/members/batch`,
    method: 'post',
    data: userIds
  })
}

// 删除任务成员
export function deleteTaskMembers(projectId, taskId, userIds) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/members`,
    method: 'delete',
    params: { userIds },
    paramsSerializer: {
      indexes: null
    }
  })
}

// 更新任务成员角色
export function updateTaskMemberRole(projectId, taskId, userId, newRole, operatorId) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/members/${userId}`,
    method: 'put',
    params: { newRole, operatorId }
  })
}

// 激活任务成员
export function activateTaskMember(projectId, taskId, userId) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/members/${userId}/activate`,
    method: 'put'
  })
}

// 发送任务完成通知
export function sendTaskCompleteNotice(projectId, taskId) {
  return request({
    url: `/projects/${projectId}/tasks/${taskId}/members/${taskId}/`,
    method: 'post'
  })
}
