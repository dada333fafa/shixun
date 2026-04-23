<template>
  <div>
    <div class="teacher-list">
      <h2>孩子的教师</h2>
      <div v-for="teacher in teachers" :key="teacher._id" class="teacher-item" @click="selectTeacher(teacher)">
        <div class="teacher-avatar">{{ teacher.user_id?.name?.charAt(0) || '教' }}</div>
        <div class="teacher-info">
          <div class="teacher-name">{{ teacher.user_id?.name || '未知教师' }}</div>
          <div class="teacher-subject">{{ teacher.subject || '未知科目' }}教师</div>
        </div>
        <button class="btn btn-primary">沟通</button>
      </div>
    </div>
    
    <div class="message-history">
      <h2>沟通记录</h2>
      <div v-for="message in messages" :key="message._id" 
           :class="['message-item', message.sender_id?._id === userId ? 'message-sent' : 'message-received']">
        <div class="message-header">
          <span class="message-sender">{{ message.sender_id?.name || '未知' }}</span>
          <span class="message-time">{{ formatTime(message.created_at) }}</span>
        </div>
        <div class="message-content">{{ message.content }}</div>
      </div>
      <div class="message-input">
        <textarea v-model="newMessage" placeholder="输入消息..."></textarea>
        <button class="btn btn-primary" @click="sendMessage">发送</button>
      </div>
    </div>
  </div>
</template>

<script>
import { get, post } from '../api/config.js'

export default {
  name: 'ParentTeacherCommunication',
  data() {
    return {
      teachers: [],
      messages: [],
      newMessage: '',
      selectedTeacher: null
    }
  },
  computed: {
    userId() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user._id
      }
      return null
    }
  },
  mounted() {
    this.fetchTeachers()
    this.fetchMessages()
  },
  methods: {
    async fetchTeachers() {
      if (!this.userId) {
        console.error('用户ID不存在，请重新登录')
        alert('用户ID不存在，请重新登录')
        return
      }
      
      try {
        // 获取与当前家长相关的教师列表
        const response = await get(`/parents/teachers/${this.userId}`)
        if (response.success) {
          this.teachers = response.teachers
        }
      } catch (error) {
        console.error('获取教师列表失败:', error)
      }
    },
    async fetchMessages() {
      if (!this.userId) {
        console.error('用户ID不存在，请重新登录')
        alert('用户ID不存在，请重新登录')
        return
      }
      
      try {
        const response = await get(`/messages/${this.userId}`)
        if (response.success) {
          this.messages = response.messages
        }
      } catch (error) {
        console.error('获取消息失败:', error)
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim()) {
        alert('请输入消息内容')
        return
      }
      
      if (!this.userId) {
        console.error('用户ID不存在，请重新登录')
        alert('用户ID不存在，请重新登录')
        return
      }
      
      try {
        const response = await post('/messages/send', {
          sender_id: this.userId,
          receiver_id: this.selectedTeacher?._id || this.teachers[0]?._id,
          content: this.newMessage
        })
        
        if (response.success) {
          this.newMessage = ''
          this.fetchMessages()
        } else {
          alert('发送失败：' + response.message)
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        alert('发送消息失败')
      }
    },
    selectTeacher(teacher) {
      this.selectedTeacher = teacher
      console.log('选择教师:', teacher)
    },
    formatTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.teacher-list {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.teacher-list h2 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.teacher-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.teacher-item:hover {
  background-color: #f9f9f9;
}

.teacher-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #FFF3E0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FF9800;
  font-weight: bold;
  font-size: 1.5em;
  margin-right: 15px;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 5px;
}

.teacher-subject {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #FF9800;
  color: white;
}

.btn-primary:hover {
  background: #F57C00;
}

.message-history {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.message-history h2 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.message-item {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 10px;
}

.message-sent {
  background: #FFF3E0;
  align-self: flex-end;
  border-bottom-right-radius: 0;
}

.message-received {
  background: #f0f8ff;
  align-self: flex-start;
  border-bottom-left-radius: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9em;
}

.message-sender {
  font-weight: bold;
  color: #FF9800;
}

.message-time {
  color: #999;
}

.message-content {
  line-height: 1.5;
}

.message-input {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.message-input textarea {
  flex: 1;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  resize: none;
  min-height: 100px;
  transition: all 0.3s ease;
}

.message-input textarea:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

@media (max-width: 768px) {
  .teacher-item {
    flex-direction: column;
    text-align: center;
  }
  
  .teacher-avatar {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .message-input {
    flex-direction: column;
  }
}
</style>
