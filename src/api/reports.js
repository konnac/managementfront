import request from './axios'

export function addReport(data) {
  return request({
    url: '/reports',
    method: 'post',
    data
  })
}

export function updateReport(id, data) {
  return request({
    url: `/reports/${id}`,
    method: 'put',
    data
  })
}

export function getReport(id) {
  return request({
    url: `/reports/${id}`,
    method: 'get'
  })
}

export function getReports(params) {
  return request({
    url: '/reports',
    method: 'get',
    params
  })
}

export function getCompletedTasksByPeriod(userId, startTime, endTime) {
  return request({
    url: '/reports/completed-tasks',
    method: 'get',
    params: {
      userId,
      startTime,
      endTime
    }
  })
}
