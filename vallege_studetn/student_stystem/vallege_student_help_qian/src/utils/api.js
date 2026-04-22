// 兼容层 - 学生端旧版API -> 新API适配
import { authAPI, teacherAPI, matchAPI, messageAPI, resourceAPI, psychologicalAPI, aiAPI } from '../api'

// 获取当前用户信息
export async function getCurrentUser() {
  try {
    const result = await authAPI.getMe()
    // 后端返回 { status, message, data: { _id, name, ... } }
    // axios拦截器已经解包了一层，所以 result.data 就是用户对象
    return result.data || result
  } catch (error) {
    throw error
  }
}

// 获取对话列表 (兼容旧版)
export async function getConversations() {
  try {
    // 调用后端聊天列表API
    const result = await messageAPI.getChatList()
    const data = result.data || []
    // 适配字段名
    return data.map(chat => ({
      userId: chat.id,
      name: chat.name,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.time,
      subject: ''
    }))
  } catch (error) {
    console.error('获取对话列表失败:', error)
    return []
  }
}

// 获取教师列表
export async function getTeachers(params) {
  try {
    const result = await teacherAPI.getTeachers(params)
    const data = result.data?.teachers || result || []
    // 适配字段名，保留 user_id 用于匹配请求
    return data.map(t => ({
      ...t,
      id: t._id || t.id,
      user_id: t.user_id || t.user_id  // 保留 User 的 ObjectId
    }))
  } catch (error) {
    throw error
  }
}

// 获取聊天消息
export async function getChatMessages(userId, params) {
  try {
    // 后端使用 user_id 参数
    const result = await messageAPI.getMessages({ user_id: userId, ...params })
    return result.data?.messages || result || []
  } catch (error) {
    throw error
  }
}

// 发送消息
export async function sendMessage(userId, content) {
  try {
    const result = await messageAPI.sendMessage(userId, content)
    // 后端返回 { status, message, data: { id, sender_id, ... } }
    return result.data || result
  } catch (error) {
    throw error
  }
}

// 发送匹配请求
export async function sendMatchRequest(teacherId, message) {
  try {
    const result = await matchAPI.createMatch(teacherId, message)
    return result.data?.match || result
  } catch (error) {
    throw error
  }
}

// 获取匹配列表
export async function getMatches(params) {
  try {
    const result = await matchAPI.getMatches(params)
    return result.data?.matches || result || []
  } catch (error) {
    throw error
  }
}

// 取消匹配请求
export async function cancelMatchRequest(id) {
  try {
    await matchAPI.deleteMatch(id)
    return true
  } catch (error) {
    throw error
  }
}

// 获取资源列表
export async function getResources(params) {
  try {
    const result = await resourceAPI.getResources(params)
    return result.data?.resources || result || []
  } catch (error) {
    throw error
  }
}

// 下载资源
export async function downloadResource(id, fileName) {
  try {
    const blob = await resourceAPI.downloadResourceFile(id)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([blob]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName || 'download')
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    throw error
  }
}

// 提交心理评估
export async function submitPsychologicalAssessment(data) {
  try {
    const result = await psychologicalAPI.createRecord(data)
    return result.data?.record || result
  } catch (error) {
    throw error
  }
}

// 获取最新心理评估
export async function getLatestAssessment() {
  try {
    const result = await psychologicalAPI.getStatus({ limit: 1 })
    const data = result.data?.status || result || []
    return Array.isArray(data) ? data[0] : data
  } catch (error) {
    throw error
  }
}

// 获取AI推荐
export async function getAIRecommendations(params) {
  try {
    const result = await aiAPI.getRecommendations(params)
    return result.data?.recommendations || result || []
  } catch (error) {
    throw error
  }
}

// 生成AI推荐
export async function generateAIRecommendation(data) {
  try {
    const result = await aiAPI.generateRecommendation(data)
    return result.data?.recommendation || result
  } catch (error) {
    throw error
  }
}

export default {
  getCurrentUser,
  getConversations,
  getTeachers,
  getChatMessages,
  sendMessage,
  sendMatchRequest,
  getMatches,
  cancelMatchRequest,
  getResources,
  downloadResource,
  submitPsychologicalAssessment,
  getLatestAssessment,
  getAIRecommendations,
  generateAIRecommendation
}
