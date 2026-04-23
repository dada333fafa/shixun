<template>
  <div class="container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <h2>学生中心</h2>
      <nav class="nav-menu">
        <router-link to="/student/dashboard">仪表盘</router-link>
        <router-link to="/student/teacher-selection">教师选择</router-link>
        <router-link to="/student/chat" class="active">聊天沟通</router-link>
        <router-link to="/student/resources">学习资源</router-link>
        <router-link to="/student/psychological">心理支持</router-link>
        <router-link to="/student/ai-recommendation">AI推荐</router-link>
        <router-link to="/student/match">匹配管理</router-link>
        <router-link to="/student/parent-requests">家长请求</router-link>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 聊天列表侧边栏 -->
      <div class="chat-sidebar">
        <div class="chat-header">聊天列表</div>
        <div class="chat-list">
          <div 
            v-for="chat in allChats" 
            :key="chat.userId"
            class="chat-item"
            :class="{ active: currentChatUserId === chat.userId }"
            @click="selectChat(chat.userId, chat.name || chat.username)"
          >
            <div class="chat-item-header">
              <div class="chat-item-name">
                {{ chat.name || chat.username }}{{ chat.subject ? ` (${chat.subject})` : '' }}
              </div>
              <div class="chat-item-time">{{ formatTime(chat.lastMessageTime) }}</div>
            </div>
            <div class="chat-item-message">{{ chat.lastMessage }}</div>
          </div>
          
          <div v-if="allChats.length === 0" class="no-chats">
            暂无聊天记录
          </div>
        </div>
      </div>

      <!-- 聊天容器 -->
      <div class="chat-container">
        <!-- 未选择聊天对象时的提示 -->
        <div v-if="!currentChatUserId" class="empty-chat">
          <div class="empty-icon">💬</div>
          <div class="empty-text">请选择聊天对象</div>
          <div class="empty-hint">从左侧列表选择一位老师开始聊天</div>
        </div>

        <!-- 聊天界面 -->
        <div v-else class="chat-content">
          <div class="chat-top-bar">
            <div class="chat-user-avatar">{{ chatPartnerName.charAt(0) }}</div>
            <div class="chat-user-info">
              <h3>{{ chatPartnerName }}</h3>
              <div class="chat-user-status">在线</div>
            </div>
          </div>

          <div class="chat-messages" ref="chatMessagesRef">
            <div 
              v-for="(msg, index) in messages" 
              :key="index"
              class="message"
              :class="isMyMessage(msg) ? 'sent' : 'received'"
            >
              <div class="message-content">{{ msg.content }}</div>
              <div class="message-time">{{ formatMessageTime(msg.created_at) }}</div>
            </div>
            
            <div v-if="messages.length === 0" class="no-messages">
              开始新的对话
            </div>
          </div>

          <div class="chat-input-area">
            <input 
              type="text" 
              v-model="inputMessage"
              @keypress.enter="sendMessage"
              class="chat-input" 
              placeholder="输入消息..."
            >
            <button class="chat-send-btn" @click="sendMessage">发送</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getConversations, getTeachers, getChatMessages, sendMessage as sendMsg } from '@/utils/api'

const router = useRouter()
const currentUser = ref(null)
const currentChatUserId = ref(null)
const chatPartnerName = ref('')
const allChats = ref([])
const messages = ref([])
const inputMessage = ref('')
const chatMessagesRef = ref(null)

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    await loadConversations()
  } catch (error) {
    console.error('初始化失败:', error)
    alert('请先登录')
    router.push('/login')
  }
})

async function loadConversations() {
  try {
    console.log('🔄 加载学生聊天列表...')
    
    // 先获取已匹配的老师列表
    const API_BASE_URL = '/api/v1'
    const token = localStorage.getItem('token')
    
    const matchResponse = await fetch(`${API_BASE_URL}/matches`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    let matchedTeachers = []
    if (matchResponse.ok) {
      const matchData = await matchResponse.json()
      const matches = matchData.data || matchData || []
      console.log('📦 匹配数据:', matches.length, '条')
      
      // 只添加已接受/活跃状态的老师（必须是active状态，表示家长和老师都同意了）
      matches.forEach(match => {
        if (match.status === 'active' && match.teacher) {
          const teacherInfo = match.teacher.user || match.teacher || {}
          const teacherUserId = teacherInfo._id || match.teacher?._id
          
          if (teacherUserId) {
            matchedTeachers.push({
              userId: teacherUserId,
              username: teacherInfo.name || teacherInfo.username || '老师',
              name: teacherInfo.name || teacherInfo.username || '老师',
              subject: match.teacher?.subject || '',
              lastMessage: '点击开始聊天',
              lastMessageTime: null
            })
          }
        }
      })
      console.log('✅ 已匹配老师数量:', matchedTeachers.length)
    }
    
    // 再加载消息列表（更新最后一条消息和时间）
    const conversations = await getConversations()
    console.log('📦 消息会话数量:', conversations.length)
    
    // 将消息与会话合并，只更新已匹配老师的消息
    const chatMap = new Map()
    
    // 先添加已匹配的老师
    matchedTeachers.forEach(teacher => {
      chatMap.set(teacher.userId, teacher)
    })
    
    // 然后更新消息
    conversations.forEach(conv => {
      if (chatMap.has(conv.userId)) {
        const matchedTeacher = chatMap.get(conv.userId)
        matchedTeacher.lastMessage = conv.lastMessage
        matchedTeacher.lastMessageTime = conv.lastMessageTime
      }
    })
    
    // 转换为数组并按时间排序
    allChats.value = Array.from(chatMap.values()).sort((a, b) => {
      if (a.lastMessage === '点击开始聊天') return 1
      if (b.lastMessage === '点击开始聊天') return -1
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    })
    
    console.log('💬 最终聊天列表:', allChats.value.map(c => c.name || c.username))
  } catch (error) {
    console.error('加载对话列表失败:', error)
  }
}

async function selectChat(userId, userName) {
  currentChatUserId.value = userId
  chatPartnerName.value = userName || '用户'
  
  await loadChatMessages(userId)
}

async function loadChatMessages(userId) {
  try {
    console.log('加载聊天消息, userId:', userId)
    const msgs = await getChatMessages(userId)
    messages.value = msgs || []
    
    console.log('加载消息成功, 数量:', messages.value.length)
    
    // 滚动到底部
    await nextTick()
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    alert('加载消息失败: ' + error.message)
  }
}

function isMyMessage(msg) {
  if (!currentUser.value) return false
  
  // 后端返回的字段是 sender_id
  const senderId = msg.sender_id
  // 用户对象的 ID 字段是 _id
  const currentUserId = currentUser.value._id || currentUser.value.id
  
  if (!senderId || !currentUserId) {
    console.log('消息判断失败:', { senderId, currentUserId, currentUser: currentUser.value })
    return false
  }
  
  return senderId.toString() === currentUserId.toString()
}

async function sendMessage() {
  const message = inputMessage.value.trim()
  
  if (!message) {
    alert('请输入消息内容')
    return
  }
  
  if (!currentChatUserId.value) {
    alert('请先选择一个聊天对象')
    return
  }
  
  try {
    const sentMessage = await sendMsg(currentChatUserId.value, message)
    
    messages.value.push(sentMessage)
    inputMessage.value = ''
    
    // 滚动到底部
    await nextTick()
    if (chatMessagesRef.value) {
      chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
    }
    
    // 重新加载对话列表
    await loadConversations()
  } catch (error) {
    console.error('发送消息失败:', error)
    alert('发送消息失败: ' + error.message)
  }
}

function formatTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  const now = new Date()
  const diff = now - date
  
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`
  } else if (diff < 48 * 60 * 60 * 1000) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

function formatMessageTime(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''
  
  return `${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`
}

function handleLogout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 20px;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.sidebar h2 {
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.6em;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-menu a,
.nav-menu .router-link-active,
.nav-menu .router-link-exact-active {
  display: block;
  padding: 12px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-menu a:hover,
.nav-menu .router-link-active:hover,
.nav-menu .router-link-exact-active:hover {
  background-color: rgba(255,255,255,0.2);
  transform: translateX(5px);
}

.nav-menu .router-link-active,
.nav-menu .router-link-exact-active {
  background-color: rgba(255,255,255,0.3);
  font-weight: bold;
}

.main-content {
  flex: 1;
  display: flex;
}

.chat-sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
  font-size: 1.1em;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-item:hover {
  background-color: #f9f9f9;
}

.chat-item.active {
  background-color: #e8f5e8;
}

.chat-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.chat-item-name {
  font-weight: bold;
}

.chat-item-time {
  font-size: 0.8em;
  color: #666;
}

.chat-item-message {
  font-size: 0.9em;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-chats {
  padding: 20px;
  text-align: center;
  color: #999;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.empty-icon {
  font-size: 4em;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.empty-hint {
  font-size: 0.9em;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-top-bar {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 15px;
}

.chat-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.chat-user-info h3 {
  margin-bottom: 2px;
}

.chat-user-status {
  font-size: 0.8em;
  color: #4CAF50;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
}

.message.received {
  align-items: flex-start;
}

.message.sent {
  align-items: flex-end;
}

.message-content {
  max-width: 70%;
  padding: 10px 15px;
  border-radius: 15px;
  word-wrap: break-word;
}

.message.received .message-content {
  background: white;
  border-bottom-left-radius: 5px;
}

.message.sent .message-content {
  background: #4CAF50;
  color: white;
  border-bottom-right-radius: 5px;
}

.message-time {
  font-size: 0.7em;
  color: #666;
  margin-top: 5px;
}

.no-messages {
  text-align: center;
  color: #999;
  padding: 20px;
}

.chat-input-area {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
}

.chat-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1em;
}

.chat-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.chat-send-btn {
  padding: 0 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chat-send-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 10px;
  }
  
  .nav-menu {
    display: flex;
    overflow-x: auto;
    gap: 10px;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .chat-sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .message-content {
    max-width: 85%;
  }
}
</style>
