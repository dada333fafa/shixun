import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api/v1', // 使用Vite代理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加Token（注册时不需要）
api.interceptors.request.use(
  (config) => {
    // 注册和登录请求不需要token
    if (!config.url.includes('/auth/register') && !config.url.includes('/auth/login')) {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      // 服务器返回错误
      if (error.response.status === 401) {
        // Token过期或无效，清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

// 认证API
export const authAPI = {
  // 注册
  register(data) {
    return api.post('/auth/register', data)
  },
  
  // 登录
  login(data) {
    return api.post('/auth/login', data)
  },
  
  // 忘记密码
  forgotPassword(data) {
    return api.post('/auth/forgot-password', data)
  },
  
  // 获取当前用户信息
  getMe() {
    return api.get('/auth/me')
  },
  
  // 更新用户信息
  updateMe(data) {
    return api.put('/auth/me', data)
  }
}

// 家长API
export const parentAPI = {
  // 获取家长的孩子列表
  getChildren(parentId) {
    return api.get(`/parents/children/${parentId}`)
  },
  
  // 获取家长仪表盘数据
  getDashboard(parentId) {
    return api.get(`/parents/dashboard/${parentId}`)
  },
  
  // 获取匹配请求
  getMatchConfirmation(parentId) {
    return api.get(`/parents/match-confirmation/${parentId}`)
  },
  
  // 同意匹配请求
  approveMatch(matchId, parentId) {
    return api.post('/parents/match/approve', { matchId, parentId })
  },
  
  // 拒绝匹配请求
  rejectMatch(matchId, parentId) {
    return api.post('/parents/match/reject', { matchId, parentId })
  },
  
  // 获取教师列表
  getTeachers(userId) {
    return api.get(`/parents/teachers/${userId}`)
  },
  
  // 获取消息
  getMessages(userId) {
    return api.get(`/parents/messages/${userId}`)
  },
  
  // 获取学习报告
  getLearningReport(studentId) {
    return api.get(`/parents/learning-report/${studentId}`)
  },
  
  // 获取心理状态
  getPsychologicalStatus(studentId) {
    return api.get(`/parents/psychological-status/${studentId}`)
  }
}

export default api
