import request from './axios'

// 获取项目列表
export function getProjects(params) {
  return request({
    url: '/projects',
    method: 'get',
    params
  })
}

// 统计项目总数量
export function countProjects() {
  return request({
    url: '/projects/count',
    method: 'get'
  })
}

// 添加项目
export function addProject(data) {
  return request({
    url: '/projects',
    method: 'post',
    data
  })
}

// 删除项目
export function deleteProject(ids, operatorId) {
  return request({
    url: `/projects/${ids}`,
    method: 'delete',
    params: { operatorId }
  })
}

// 更新项目
export function updateProject(data, operatorId) {
  return request({
    url: '/projects',
    method: 'put',
    params: { operatorId },
    data
  })
}

// 获取项目成员列表（分页）
export function getProjectMembers(params) {
  return request({
    url: '/projects/' + params.id + '/members',
    method: 'get',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      name: params.name,
      realName: params.realName,
      userRole: params.userRole,
      department: params.department
    }
  })
}

// 添加项目成员
export function addProjectMember(data, operatorId) {
  return request({
    url: '/projects/' + data.projectId + '/members',
    method: 'post',
    params: { operatorId },
    data
  })
}

// 更新项目成员角色
export function updateProjectMemberRole(data) {
  const roleValue = data.role === 'CUSTOM' ? data.customRole : data.role
  return request({
    url: '/projects/' + data.projectId + '/members/' + data.userId,
    method: 'put',
    data: {
      projectRole: roleValue
    }
  })
}

// 移除项目成员
export function removeProjectMember(projectId, memberId, operatorId) {
  return request({
    url: '/projects/' + projectId + '/members/' + memberId,
    method: 'delete',
    params: { operatorId }
  })
}

// 激活项目成员
export function activateProjectMember(projectId, userId) {
  return request({
    url: '/projects/' + projectId + '/members/' + userId + '/activate',
    method: 'put'
  })
}