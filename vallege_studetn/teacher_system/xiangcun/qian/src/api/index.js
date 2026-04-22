import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api/v1', // 使用Vite代理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 自动添加Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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

// 教师API
export const teacherAPI = {
  // 获取教师列表
  getTeachers(params) {
    return api.get('/teachers', { params })
  },
  
  // 获取教师详情
  getTeacherById(id) {
    return api.get(`/teachers/${id}`)
  },
  
  // 获取仪表盘数据
  getDashboard() {
    return api.get('/teachers/dashboard')
  }
}

// 学生API
export const studentAPI = {
  // 获取学生列表
  getStudents(params) {
    return api.get('/students', { params })
  },
  
  // 获取学生详情
  getStudentById(id) {
    return api.get(`/students/${id}`)
  }
}

// 匹配API
export const matchAPI = {
  // 创建匹配
  createMatch(data) {
    return api.post('/matches', data)
  },
  
  // 获取匹配列表
  getMatches(params) {
    return api.get('/matches', { params })
  },
  
  // 获取匹配详情
  getMatchById(id) {
    return api.get(`/matches/${id}`)
  },
  
  // 更新匹配
  updateMatch(id, data) {
    return api.put(`/matches/${id}`, data)
  },
  
  // 删除匹配
  deleteMatch(id) {
    return api.delete(`/matches/${id}`)
  }
}

// 消息API
export const messageAPI = {
  // 发送消息
  sendMessage(data) {
    return api.post('/messages', data)
  },
  
  // 获取消息列表
  getMessages(params) {
    return api.get('/messages', { params })
  },
  
  // 标记已读
  markAsRead(id) {
    return api.put(`/messages/${id}/read`)
  }
}

// 咨询师API
export const counselorAPI = {
  // 获取咨询师列表
  getCounselors() {
    return api.get('/counselors')
  }
}

// 资源API
export const resourceAPI = {
  // 上传资源
  uploadResource(formData) {
    return api.post('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 获取资源列表
  getResources(params) {
    return api.get('/resources', { params })
  },
  
  // 获取资源详情
  getResourceById(id) {
    return api.get(`/resources/${id}`)
  },
  
  // 删除资源
  deleteResource(id) {
    return api.delete(`/resources/${id}`)
  }
}

// 心理状态API
export const psychologicalAPI = {
  // 创建心理记录
  createRecord(data) {
    return api.post('/psychological', data)
  },
  
  // 获取心理状态列表
  getStatus(params) {
    return api.get('/psychological', { params })
  }
}

// 学习进度API
export const learningProgressAPI = {
  // 获取学习进度
  getProgress(params) {
    return api.get('/learning-progress', { params })
  },
  
  // 更新学习进度
  updateProgress(id, data) {
    return api.put(`/learning-progress/${id}`, data)
  }
}

// AI推荐API
export const aiAPI = {
  // 获取推荐列表
  getRecommendations(params) {
    return api.get('/ai', { params })
  },
  
  // 生成推荐
  generateRecommendation(data) {
    return api.post('/ai/generate', data)
  }
}

export default api
