import request from './axios'

export function getUnreadCount(userId) {
  return request({
    url: '/notifications',
    method: 'get',
    params: { userId }
  })
}

export function getNotifications(params) {
  return request({
    url: '/notifications/page',
    method: 'get',
    params
  })
}

export function markAsRead(id, userId) {
  return request({
    url: `/notifications/${id}/read`,
    method: 'post',
    params: { userId }
  })
}

export function markAsReadBatch(notificationIds, userId) {
  return request({
    url: '/notifications/read-batch',
    method: 'post',
    params: { userId },
    data: notificationIds
  })
}

export function markAllAsRead(userId) {
  return request({
    url: '/notifications/read-all',
    method: 'post',
    params: { userId }
  })
}

export function deleteBatchNotifications(notificationIds, userId) {
  return request({
    url: '/notifications/batch',
    method: 'post',
    params: { userId },
    data: notificationIds
  })
}

export function deleteAllReadNotifications(userId) {
  return request({
    url: '/notifications/read',
    method: 'delete',
    params: { userId }
  })
}

export function deleteNotificationsBeforeDate(userId, beforeDate) {
  return request({
    url: '/notifications/by-date',
    method: 'delete',
    params: { userId, beforeDate }
  })
}

export function getNotificationDetail(id) {
  return request({
    url: `/notifications/detail/${id}`,
    method: 'get'
  })
}

export function sendNorNotification(userIds, notification) {
  return request({
    url: '/notifications/send/nor-noti',
    method: 'post',
    params: { userIds: userIds.join(',') },
    data: notification
  })
}

export function sendSysNotification(userIds, notification) {
  return request({
    url: '/notifications/send/sys-noti',
    method: 'post',
    params: { userIds: userIds.join(',') },
    data: notification
  })
}

export function sendNotificationToUser(userId, title, content, type, relatedType, relatedId) {
  return request({
    url: '/notifications/send/to-user',
    method: 'post',
    params: { userId, title, content, type, relatedType, relatedId }
  })
}

export function sendBatchNotificationToUsers(userIds, title, content, type, relatedType, relatedId) {
  return request({
    url: '/notifications/send/batch',
    method: 'post',
    params: { userIds, title, content, type, relatedType, relatedId }
  })
}

export function sendNotificationToProjectMembers(projectId, title, content, type) {
  return request({
    url: '/notifications/send/project-members',
    method: 'post',
    params: { projectId, title, content, type }
  })
}

export function sendNotificationToTaskMembers(projectId, taskId, title, content, type) {
  return request({
    url: '/notifications/send/task-members',
    method: 'post',
    params: { projectId, taskId, title, content, type }
  })
}
