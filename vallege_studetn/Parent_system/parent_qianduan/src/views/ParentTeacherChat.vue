<template>
  <div class="chat-page">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <button class="back-button" @click="goBack">
        <span>←</span> 返回
      </button>
      <div class="chat-title">
        <h2>与 {{ teacherName }} 的聊天</h2>
        <span class="child-name">（{{ childName }} 的老师）</span>
      </div>
      <div class="header-spacer"></div>
    </div>

    <!-- 消息列表 -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="messages.length === 0" class="no-messages">
        <p>暂无消息，开始对话吧！</p>
      </div>
      
      <div v-for="(message, index) in messages" :key="message._id || index" class="message-wrapper">
        <!-- 时间戳显示（每隔5分钟显示一次） -->
        <div v-if="shouldShowTime(message, index)" class="message-time-divider">
          <span>{{ formatMessageTime(message.createdAt || message.created_at) }}</span>
        </div>
        
        <!-- 消息气泡 -->
        <div :class="['message-row', isOwnMessage(message) ? 'message-row-sent' : 'message-row-received']">
          <div :class="['message-bubble', isOwnMessage(message) ? 'message-sent' : 'message-received']">
            <div class="message-content">
              <p>{{ message.content }}</p>
            </div>
          </div>
          <div class="message-time-outside">
            {{ formatShortTime(message.createdAt || message.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="input-area">
      <textarea 
        v-model="newMessage" 
        placeholder="输入消息..."
        @keydown.enter.exact.prevent="sendMessage"
        rows="1"
      ></textarea>
      <button class="send-button" @click="sendMessage" :disabled="!newMessage.trim()">
        发送
      </button>
    </div>
  </div>
</template>

<script>
import { get, post } from '../api/config.js'
import { useRouter, useRoute } from 'vue-router'

export default {
  name: 'ParentTeacherChat',
  data() {
    return {
      messages: [],
      newMessage: '',
      teacherId: null,
      teacherName: '',
      childName: '',
      pollingTimer: null
    }
  },
  computed: {
    userId() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user.id || user._id
      }
      return null
    }
  },
  created() {
    // 获取路由参数
    const route = this.$route
    this.teacherId = route.query.teacherId
    this.teacherName = route.query.teacherName || '教师'
    this.childName = route.query.childName || '孩子'
    
    if (this.teacherId) {
      this.fetchMessages()
      // 每3秒轮询新消息
      this.pollingTimer = setInterval(() => {
        this.fetchMessages()
      }, 3000)
    }
  },
  beforeUnmount() {
    // 清除轮询
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
    }
  },
  updated() {
    // 滚动到底部
    this.scrollToBottom()
  },
  methods: {
    async fetchMessages() {
      if (!this.userId || !this.teacherId) {
        return
      }
      
      try {
        const response = await get(`/messages/conversation/${this.userId}/${this.teacherId}`)
        if (response.success) {
          this.messages = response.messages || []
        }
      } catch (error) {
        console.error('获取消息失败:', error)
      }
    },
    
    async sendMessage() {
      if (!this.newMessage.trim()) {
        return
      }
      
      if (!this.userId || !this.teacherId) {
        console.error('用户ID或教师ID不存在')
        alert('发送失败，请重试')
        return
      }
      
      try {
        const response = await post('/messages/', {
          sender_id: this.userId,
          receiver_id: this.teacherId,
          content: this.newMessage.trim()
        })
        
        if (response.success || response.message === '消息发送成功') {
          this.newMessage = ''
          await this.fetchMessages()
          this.scrollToBottom()
        } else {
          alert('发送失败：' + (response.message || '未知错误'))
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        alert('发送消息失败，请检查网络连接')
      }
    },
    
    isOwnMessage(message) {
      // 兼容两种字段命名：senderId 和 sender_id
      const senderId = message.senderId?._id || message.senderId || message.sender_id?._id || message.sender_id
      return senderId === this.userId
    },
    
    shouldShowTime(message, index) {
      if (index === 0) return true
      
      const prevMessage = this.messages[index - 1]
      const currentTime = new Date(message.createdAt || message.created_at).getTime()
      const prevTime = new Date(prevMessage.createdAt || prevMessage.created_at).getTime()
      
      // 如果与上一条消息间隔超过5分钟，显示时间
      return (currentTime - prevTime) > 5 * 60 * 1000
    },
    
    formatMessageTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      
      if (messageDate.getTime() === today.getTime()) {
        return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (messageDate.getTime() === yesterday.getTime()) {
        return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    formatShortTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    },
    
    goBack() {
      this.$router.push('/teacher-communication')
    }
  }
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ededed;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
  z-index: 10;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.back-button:hover {
  background: #f57c00;
}

.chat-title {
  flex: 1;
  text-align: center;
}

.chat-title h2 {
  margin: 0 0 4px 0;
  font-size: 17px;
  color: #333;
  font-weight: 600;
}

.child-name {
  font-size: 12px;
  color: #999;
  display: block;
}

.header-spacer {
  width: 80px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  background: #ededed;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.no-messages {
  text-align: center;
  color: #999;
  margin: auto;
  font-size: 14px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  animation: fadeIn 0.3s ease-in-out;
}

.message-wrapper:last-child {
  margin-bottom: 0;
}

.message-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.message-row-sent {
  align-items: flex-end;
}

.message-row-received {
  align-items: flex-start;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-time-divider {
  text-align: center;
  margin: 20px 0;
}

.message-time-divider span {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.08);
  color: #999;
  border-radius: 12px;
  font-size: 11px;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  display: inline-block;
}

.message-sent {
  background: #ff9800;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-received {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.message-content p {
  margin: 0;
  line-height: 1.5;
  font-size: 17px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-time-outside {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  padding: 0 4px;
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #f8f8f8;
  border-top: 1px solid #e0e0e0;
}

.input-area textarea {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  min-height: 40px;
  max-height: 100px;
  transition: border-color 0.2s;
  background: white;
}

.input-area textarea:focus {
  outline: none;
  border-color: #ff9800;
}

.input-area textarea::placeholder {
  color: #bbb;
}

.send-button {
  padding: 10px 24px;
  background: #ff9800;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.send-button:hover:not(:disabled) {
  background: #f57c00;
}

.send-button:active:not(:disabled) {
  transform: scale(0.98);
}

.send-button:disabled {
  background: #e0e0e0;
  color: #9e9e9e;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
