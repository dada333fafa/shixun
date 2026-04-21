// API 配置文件
const API_BASE_URL = '/api' // 使用Vite代理

// 用户注册
export async function registerUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '注册失败')
    }

    const data = await response.json()
    console.log('注册成功:', data)
    return data
  } catch (error) {
    console.error('注册时出错:', error)
    throw error
  }
}

// 用户登录
export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '登录失败')
    }

    const data = await response.json()
    console.log('登录成功:', data)
    
    // 保存token到localStorage
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    
    return data
  } catch (error) {
    console.error('登录时出错:', error)
    throw error
  }
}

// 获取当前用户信息
export async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }
    
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.msg || '获取用户信息失败')
    }
    
    console.log('获取用户信息成功:', data)
    
    // 确保返回的对象有id属性（MongoDB使用_id）
    return {
      ...data,
      id: data._id || data.id  // 兼容_id和id
    }
  } catch (error) {
    console.error('获取用户信息时出错:', error)
    throw error
  }
}

// 获取教师列表
export async function getTeachers() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    const response = await fetch(`${API_BASE_URL}/users/teachers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '获取教师列表失败')
    }

    const data = await response.json()
    console.log('获取教师列表成功:', data)
    return data
  } catch (error) {
    console.error('获取教师列表时出错:', error)
    throw error
  }
}

// 发送辅导请求
export async function sendMatchRequest(teacherId, message) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    console.log('sendMatchRequest 调用:', { teacherId, message, token: token.substring(0, 20) + '...' })

    const response = await fetch(`${API_BASE_URL}/matches/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ teacherId, message })
    })

    console.log('sendMatchRequest 响应状态:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('sendMatchRequest 错误:', errorData)
      throw new Error(errorData.msg || '发送请求失败')
    }

    const data = await response.json()
    console.log('发送请求成功:', data)
    return data
  } catch (error) {
    console.error('发送请求时出错:', error)
    throw error
  }
}

// 获取匹配列表
export async function getMatches() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '获取匹配列表失败')
    }

    const data = await response.json()
    console.log('获取匹配列表成功:', data)
    return data
  } catch (error) {
    console.error('获取匹配列表时出错:', error)
    throw error
  }
}

// 取消辅导请求
export async function cancelMatchRequest(matchId) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '取消请求失败')
    }

    const data = await response.json()
    console.log('取消请求成功:', data)
    return data
  } catch (error) {
    console.error('取消请求时出错:', error)
    throw error
  }
}

// 提交心理健康评估
export async function submitPsychologicalAssessment(assessmentData) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    console.log('submitPsychologicalAssessment 调用:', assessmentData)

    const response = await fetch(`${API_BASE_URL}/psychological/assess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify(assessmentData)
    })

    console.log('submitPsychologicalAssessment 响应状态:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('submitPsychologicalAssessment 错误:', errorData)
      throw new Error(errorData.msg || '提交评估失败')
    }

    const data = await response.json()
    console.log('提交评估成功:', data)
    return data
  } catch (error) {
    console.error('提交评估时出错:', error)
    throw error
  }
}

// 获取心理评估历史
export async function getPsychologicalHistory() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    const response = await fetch(`${API_BASE_URL}/psychological/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '获取评估历史失败')
    }

    const data = await response.json()
    console.log('获取评估历史成功:', data)
    return data
  } catch (error) {
    console.error('获取评估历史时出错:', error)
    throw error
  }
}

// 获取最新评估结果
export async function getLatestAssessment() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    const response = await fetch(`${API_BASE_URL}/psychological/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '获取评估结果失败')
    }

    const data = await response.json()
    console.log('获取最新评估成功:', data)
    return data
  } catch (error) {
    console.error('获取最新评估时出错:', error)
    throw error
  }
}

// 获取学习资源列表（支持搜索和筛选）
export async function getResources(params = {}) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    // 构建查询参数
    const queryParams = new URLSearchParams()
    if (params.keyword) queryParams.append('keyword', params.keyword)
    if (params.subject) queryParams.append('subject', params.subject)
    if (params.resourceType) queryParams.append('resourceType', params.resourceType)

    const queryString = queryParams.toString()
    const url = `${API_BASE_URL}/resources${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '获取资源列表失败')
    }

    const data = await response.json()
    console.log('获取资源列表成功:', data.length, '个资源')
    return data
  } catch (error) {
    console.error('获取资源列表时出错:', error)
    throw error
  }
}

// 下载资源
export async function downloadResource(resourceId) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    const response = await fetch(`${API_BASE_URL}/resources/${resourceId}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '下载资源失败')
    }

    const data = await response.json()
    console.log('下载资源成功:', data)
    return data
  } catch (error) {
    console.error('下载资源时出错:', error)
    throw error
  }
}

// 获取聊天消息
export async function getChatMessages(otherUserId) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    console.log('调用 getChatMessages API, otherUserId:', otherUserId)

    // 后端路由是 GET /api/messages/:userId
    const response = await fetch(`${API_BASE_URL}/messages/${otherUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    console.log('getChatMessages 响应状态:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('getChatMessages 错误:', errorData)
      throw new Error(errorData.msg || '获取消息失败')
    }

    const data = await response.json()
    console.log('获取消息成功, 数量:', data.length)
    return data
  } catch (error) {
    console.error('获取消息时出错:', error)
    throw error
  }
}

// 发送聊天消息
export async function sendMessage(receiverId, content) {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ receiverId, content })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.msg || '发送消息失败')
    }

    const data = await response.json()
    console.log('发送消息成功:', data)
    return data
  } catch (error) {
    console.error('发送消息时出错:', error)
    throw error
  }
}

// 获取对话列表
export async function getConversations() {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('未找到认证令牌')
    }

    console.log('调用 getConversations API')

    const response = await fetch(`${API_BASE_URL}/messages/conversations/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    })

    console.log('getConversations 响应状态:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('getConversations 错误:', errorData)
      throw new Error(errorData.msg || '获取对话列表失败')
    }

    const data = await response.json()
    console.log('获取对话列表成功:', data)
    return data
  } catch (error) {
    console.error('获取对话列表时出错:', error)
    throw error
  }
}

console.log("API连接配置完成，后端URL:", API_BASE_URL)
