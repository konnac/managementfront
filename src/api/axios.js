import axios from 'axios'
import ElementUI from 'element-ui'

// 创建axios实例
const service = axios.create({
  baseURL: '/api', // API基础路径
  timeout: 15000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage中获取token
    const token = localStorage.getItem('token')
    // 如果token存在，添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 请求错误处理
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    if (response.config.responseType === 'blob') {
      return response
    }
    
    // 获取响应数据
    const res = response.data
    
    // 根据后端返回的状态码处理
    if (res.code !== 200) {
      // 错误提示
      ElementUI.Message({
        message: res.msg || '请求失败',
        type: 'error',
        duration: 3 * 1000
      })
      
      // 处理token过期或无效的情况
      if (res.code === 401) {
        // 清除本地token
        localStorage.removeItem('token')
        // 跳转到登录页面
        window.location.href = '/login'
      }
      
      // 处理无权限访问的情况
      if (res.code === 403) {
        // 跳转到首页或上一页
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/'
        }
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  error => {
    // 响应错误处理
    console.error('响应错误:', error)
    
    // 如果是下载文件的请求，且响应类型是blob，检查是否是业务错误
    if (error.config && error.config.responseType === 'blob' && error.response) {
      const blob = error.response.data
      // 如果blob是JSON类型，说明是业务错误
      if (blob.type === 'application/json') {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const result = JSON.parse(reader.result)
              ElementUI.Message({
                message: result.msg || '下载失败',
                type: 'error',
                duration: 3 * 1000
              })
              reject(new Error(result.msg || '下载失败'))
            } catch (e) {
              reject(error)
            }
          }
          reader.onerror = () => reject(error)
          reader.readAsText(blob)
        })
      }
    }
    
    // 处理HTTP状态码
    if (error.response) {
      const status = error.response.status
      
      // 处理401未登录
      if (status === 401) {
        ElementUI.Message({
          message: '未登录或登录已过期，请重新登录',
          type: 'error',
          duration: 3 * 1000
        })
        localStorage.removeItem('token')
        window.location.href = '/login'
        return Promise.reject(error)
      }
      
      // 处理403无权限
      if (status === 403) {
        ElementUI.Message({
          message: error.response.data?.message || '无权限访问该资源',
          type: 'error',
          duration: 3 * 1000
        })
        if (window.history.length > 1) {
          window.history.back()
        } else {
          window.location.href = '/'
        }
        return Promise.reject(error)
      }
      
      // 处理其他HTTP错误
      ElementUI.Message({
        message: `请求失败 (${status}): ${error.response.data?.msg || '服务器错误'}`,
        type: 'error',
        duration: 3 * 1000
      })
    } else {
      // 网络错误提示
      ElementUI.Message({
        message: '网络错误，请稍后重试',
        type: 'error',
        duration: 3 * 1000
      })
    }
    
    return Promise.reject(error)
  }
)

export default service