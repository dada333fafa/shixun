import axios from 'axios'

// 创建axios实例，配置基础URL为教师端后端
const apiClient = axios.create({
  baseURL: '/api/v1', // 使用代理，指向教师端后端
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动携带Token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理401未授权错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token过期或无效,清除本地存储并跳转到登录页
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getMe: () => apiClient.get('/auth/me'),
  updateMe: (data) => apiClient.put('/auth/me', data)
}

// 管理员相关API
export const adminAPI = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  addUser: (userData) => apiClient.post('/admin/users', userData),
  updateUser: (id, userData) => apiClient.put(`/admin/users/${id}`, userData),
  updateUserStatus: (id, status) => apiClient.put(`/admin/users/${id}/status`, status),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  getStats: () => apiClient.get('/admin/stats')
}

export default apiClient