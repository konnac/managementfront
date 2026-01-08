import request from './axios'

// 获取任务列表（项目下的任务）
export function getTasks(projectId, params) {
  return request({
    url: `/projects/${projectId}/tasks`,
    method: 'get',
    params
  })
}

// 添加任务（项目下）
export function addTask(projectId, data) {
  return request({
    url: `/projects/${projectId}/tasks`,
    method: 'post',
    data
  })
}

// 删除任务（项目下）
export function deleteTask(projectId, ids) {
  return request({
    url: `/projects/${projectId}/tasks/${ids}`,
    method: 'delete'
  })
}

// 更新任务（项目下）
export function updateTask(projectId, id, data) {
  return request({
    url: `/projects/${projectId}/tasks/${id}`,
    method: 'put',
    data
  })
}

// 获取任务详情（项目下）
export function getTaskDetail(projectId, id) {
  return request({
    url: `/projects/${projectId}/tasks/${id}`,
    method: 'get'
  })
}

// 获取"我的任务"列表
export function getMyTasks(params) {
  return request({
    url: '/my-tasks',
    method: 'get',
    params
  })
}
