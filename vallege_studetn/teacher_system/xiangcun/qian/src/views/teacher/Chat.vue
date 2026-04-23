<template>
  <div class="teacher-chat">
    <header>
      <div class="header-content">
        <div class="logo">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E" alt="乡村助学平台">
          乡村助学平台
        </div>
        <nav class="nav">
          <router-link to="/teacher/dashboard">首页</router-link>
          <router-link to="/teacher/match-management">匹配管理</router-link>
          <router-link to="/teacher/chat">聊天</router-link>
          <router-link to="/teacher/resources">资源管理</router-link>
          <router-link to="/teacher/psychological">心理支持</router-link>
          <router-link to="/">退出</router-link>
        </nav>
        <div class="user-info">
          <span>{{ userDisplayName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
    </header>
    
    <div class="chat-container">
      <div class="chat-sidebar">
        <div class="chat-header">
          <h2>消息列表</h2>
        </div>
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索学生...">
        </div>
        <div class="chat-list">
          <div 
            v-for="chat in filteredChats" 
            :key="chat.id"
            class="chat-item"
            :class="{ active: selectedChat?.id === chat.id }"
            @click="selectChat(chat)"
          >
            <div class="chat-avatar">{{ chat.name[0] }}</div>
            <div class="chat-info">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="chat-message">{{ chat.info || chat.lastMessage }}</div>
            </div>
            <div class="chat-time">{{ chat.time }}</div>
          </div>
        </div>
      </div>
      
      <div class="chat-main" v-if="selectedChat">
        <div class="chat-main-header">
          <div class="chat-main-avatar">{{ selectedChat.name[0] }}</div>
          <div class="chat-main-info">
            <h3>{{ selectedChat.name }}</h3>
            <p>{{ selectedChat.info || '学生' }}</p>
          </div>
        </div>
        
        <div class="chat-messages" ref="messagesContainer">
          <div 
            v-for="message in messages" 
            :key="message.id"
            class="message"
            :class="message.type"
          >
            <div class="message-content">{{ message.content }}</div>
            <div class="message-time">{{ formatMessageTime(message.created_at) }}</div>
          </div>
        </div>
        
        <div class="chat-input">
          <form class="chat-input-form" @submit.prevent="sendMessage">
            <textarea 
              v-model="newMessage" 
              placeholder="输入消息..."
              @keydown.enter.ctrl="sendMessage"
            ></textarea>
            <button type="submit" :disabled="sending">{{ sending ? '发送中...' : '发送' }}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'

const API_BASE_URL = '/api/v1'

// 从 localStorage 获取用户信息
const userInfo = ref(null)
const token = ref('')

onMounted(async () => {
  // 加载用户信息和 token
  const userStr = localStorage.getItem('user')
  if (userStr) {
    userInfo.value = JSON.parse(userStr)
    token.value = userInfo.value.token || ''
  }
  
  // 加载聊天列表
  await loadChatList()
  
  // 启动定时刷新（每3秒刷新一次）
  refreshInterval = setInterval(() => {
    loadChatList()
    if (selectedChat.value) {
      loadMessages(selectedChat.value.id)
    }
  }, 3000)
})

// 组件卸载时清除定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// 获取用户姓氏（用于头像显示）
const userInitial = computed(() => {
  if (userInfo.value && userInfo.value.name) {
    return userInfo.value.name.charAt(0)
  }
  return '李'
})

// 获取用户称呼
const userDisplayName = computed(() => {
  if (userInfo.value && userInfo.value.name) {
    return userInfo.value.name
  }
  return '李老师'
})

const searchQuery = ref('')
const newMessage = ref('')
const messagesContainer = ref(null)
const chats = ref([])
const selectedChat = ref(null)
const messages = ref([])
const sending = ref(false)
let refreshInterval = null // 定时刷新定时器

const filteredChats = computed(() => {
  if (!searchQuery.value) return chats.value
  const query = searchQuery.value.toLowerCase()
  return chats.value.filter(c => c.name.toLowerCase().includes(query))
})

// 加载聊天列表
const loadChatList = async () => {
  try {
    console.log('🔄 加载聊天列表...')
    
    // 直接从后端获取已匹配的学生聊天列表
    const msgResponse = await fetch(`${API_BASE_URL}/messages/list`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (msgResponse.ok) {
      const data = await msgResponse.json()
      if (data.status === 'success' || data.success) {
        chats.value = data.data || data.chats || []
        console.log('💬 聊天列表:', chats.value.map(c => c.name))
        
        // 如果有聊天列表，选择第一个
        if (chats.value.length > 0 && !selectedChat.value) {
          selectChat(chats.value[0])
        }
      }
    }
  } catch (error) {
    console.error('加载聊天列表失败:', error)
  }
}

// 选择聊天
const selectChat = async (chat) => {
  selectedChat.value = chat
  await loadMessages(chat.id)
}

// 加载消息
const loadMessages = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    const data = await response.json()
    if (data.status === 'success') {
      messages.value = data.data.messages.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        type: msg.sender_id === userInfo.value.id ? 'sent' : 'received',
        content: msg.content,
        created_at: msg.created_at
      }))
      
      // 滚动到底部
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }
  } catch (error) {
    console.error('加载消息失败:', error)
  }
}

// 发送消息
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) return
  
  try {
    sending.value = true
    
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.value}`
      },
      body: JSON.stringify({
        receiver_id: selectedChat.value.userId || selectedChat.value.id,
        content: newMessage.value,
        type: 'text'
      })
    })
    
    const data = await response.json()
    if (data.status === 'success' || data.success) {
      // 添加新消息到列表
      messages.value.push({
        id: data.data.id,
        sender_id: data.data.sender_id,
        type: 'sent',
        content: data.data.content,
        created_at: data.data.created_at
      })
      
      // 更新聊天列表
      selectedChat.value.lastMessage = newMessage.value
      selectedChat.value.time = '刚刚'
      
      // 清空输入框
      newMessage.value = ''
      
      // 滚动到底部
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    } else {
      alert('发送失败: ' + data.message)
    }
  } catch (error) {
    console.error('发送消息失败:', error)
    alert('发送失败，请重试')
  } finally {
    sending.value = false
  }
}

// 格式化消息时间
const formatMessageTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 监听 selectedChat 变化，重新加载消息
watch(selectedChat, (newChat) => {
  if (newChat) {
    loadMessages(newChat.id)
  }
})
</script>

<style scoped>
.teacher-chat {
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo img {
  width: 40px;
  height: 40px;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.nav a:hover,
.nav a.router-link-active {
  transform: translateY(-3px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  font-weight: bold;
}

.chat-container {
  display: flex;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  overflow: hidden;
  min-height: 600px;
}

.chat-sidebar {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  background: #f9f9f9;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.chat-header h2 {
  color: #333;
  font-size: 18px;
}

.search-box {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.search-box input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-box input:focus {
  border-color: #667eea;
}

.chat-list {
  overflow-y: auto;
  height: calc(100vh - 280px);
}

.chat-item {
  padding: 15px 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.3s ease;
  min-height: 70px;
}

.chat-item:hover {
  background-color: #f0f0f0;
}

.chat-item.active {
  background-color: #f0f0f0;
}

.chat-avatar {
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.chat-info {
  flex: 1;
}

.chat-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.chat-message {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: #999;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-main-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 15px;
  background: white;
}

.chat-main-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.chat-main-info h3 {
  color: #333;
  margin-bottom: 5px;
}

.chat-main-info p {
  font-size: 14px;
  color: #666;
}

.chat-messages {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: #f9f9f9;
}

.message {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.message.sent {
  align-items: flex-end;
}

.message.received {
  align-items: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 15px;
  border-radius: 18px;
  position: relative;
}

.message.sent .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 5px;
}

.message.received .message-content {
  background: white;
  color: #333;
  border-bottom-left-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.chat-input {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
}

.chat-input-form {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.chat-input textarea {
  flex: 1;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 25px;
  resize: none;
  outline: none;
  transition: border-color 0.3s ease;
  min-height: 80px;
}

.chat-input textarea:focus {
  border-color: #667eea;
}

.chat-input button {
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.chat-input button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .chat-container {
    flex-direction: column;
  }
  
  .chat-sidebar {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .chat-list {
    height: 200px;
  }
  
  .chat-messages {
    padding: 15px;
  }
  
  .message-content {
    max-width: 85%;
  }
}
</style>
