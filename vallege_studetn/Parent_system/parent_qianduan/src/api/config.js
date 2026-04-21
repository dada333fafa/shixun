// API配置
export const API_BASE_URL = 'http://localhost:3000/api'

// 封装fetch请求
export async function request(url, options = {}) {
  const fullUrl = `${API_BASE_URL}${url}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  const response = await fetch(fullUrl, { ...defaultOptions, ...options })
  return response.json()
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
