// API配置
// 使用相对路径，通过Vite代理转发到后端
export const API_BASE_URL = '/api'

// 封装fetch请求
export async function request(url, options = {}) {
  const fullUrl = `${API_BASE_URL}${url}`
  
  // 获取token - 从user对象中读取
  let token = localStorage.getItem('token')
  if (!token) {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        token = user.token
      } catch (e) {
        console.error('解析user数据失败:', e)
      }
    }
  }
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
  }
  
  const response = await fetch(fullUrl, { ...defaultOptions, ...options })
  const data = await response.json()
  
  // 如果响应失败，抛出错误
  if (!response.ok) {
    throw new Error(data.message || data.msg || '请求失败')
  }
  
  return data
}

// GET请求
export function get(url) {
  return request(url, { method: 'GET' })
}

// POST请求
export function post(url, data) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// PUT请求
export function put(url, data) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
