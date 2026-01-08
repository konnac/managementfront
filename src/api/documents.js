import request from './axios'

export function getProjectDocuments(params) {
  return request({
    url: '/documents',
    method: 'get',
    params
  })
}

export function uploadDocument(data) {
  return request({
    url: '/documents/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function downloadDocument(id) {
  return request({
    url: `/documents/download/${id}`,
    method: 'get',
    responseType: 'blob'
  })
}

export function deleteDocument(id) {
  return request({
    url: `/documents/${id}`,
    method: 'delete'
  })
}

export function getDocumentCategories() {
  return request({
    url: '/documents/categories',
    method: 'get'
  })
}
