<template>
  <div>
    <!-- 按孩子分组显示教师 -->
    <div v-for="(childData, childIndex) in childrenWithTeachers" :key="childData.child._id" class="child-teacher-section">
      <div class="child-header">
        <h3>{{ childData.child.user_id?.name || '未知孩子' }}的教师</h3>
      </div>
      <div class="teacher-list">
        <div v-for="teacher in childData.teachers" :key="teacher._id" class="teacher-item">
          <div class="teacher-avatar">{{ teacher.user?.name?.charAt(0) || '教' }}</div>
          <div class="teacher-info">
            <div class="teacher-name">{{ teacher.user?.name || '未知教师' }}</div>
            <div class="teacher-subject">{{ teacher.subject || '未设置' }}教师</div>
          </div>
          <button class="btn btn-primary" @click="goToChat(teacher, childData.child)">沟通</button>
        </div>
      </div>
    </div>
    
    <!-- 移除旧的消息显示区域 -->
  </div>
</template>

<script>
import { get } from '../api/config.js'

export default {
  name: 'ParentTeacherCommunication',
  data() {
    return {
      children: [],
      childrenWithTeachers: []
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
  mounted() {
    this.fetchChildren()
  },
  methods: {
    async fetchChildren() {
      if (!this.userId) {
        console.error('用户ID不存在，请重新登录')
        alert('用户ID不存在，请重新登录')
        return
      }
      
      try {
        // 获取家长的所有孩子
        const response = await get(`/parents/children/${this.userId}`)
        if (response.success) {
          this.children = response.children
          // 获取每个孩子的教师
          this.fetchTeachersForEachChild()
        }
      } catch (error) {
        console.error('获取孩子列表失败:', error)
      }
    },
    async fetchTeachersForEachChild() {
      this.childrenWithTeachers = []
      
      for (const child of this.children) {
        try {
          // 获取与当前孩子相关的教师列表
          const response = await get(`/parents/child-teachers/${child._id}`)
          if (response.success) {
            this.childrenWithTeachers.push({
              child: child,
              teachers: response.teachers || []
            })
          }
        } catch (error) {
          console.error(`获取孩子 ${child.user_id?.name} 的教师列表失败:`, error)
          // 即使失败也添加孩子，只是教师列表为空
          this.childrenWithTeachers.push({
            child: child,
            teachers: []
          })
        }
      }
    },
    goToChat(teacher, child) {
      // 跳转到聊天页面，传递必要的参数
      this.$router.push({
        path: '/teacher-chat',
        query: {
          teacherId: teacher.user._id,
          teacherName: teacher.user.name || '教师',
          childName: child.user_id?.name || '孩子'
        }
      })
    }
  }
}
</script>

<style scoped>
.child-teacher-section {
  margin-bottom: 30px;
}

.child-header {
  background: #FFF3E0;
  padding: 15px 20px;
  border-radius: 10px 10px 0 0;
  border-left: 5px solid #FF9800;
}

.child-header h3 {
  color: #FF9800;
  margin: 0;
  font-size: 1.3em;
}

.teacher-list {
  background: white;
  padding: 20px;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
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

.teacher-item:last-child {
  border-bottom: none;
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

.messages-container {
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 20px;
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

.no-selection {
  color: #999;
  text-align: center;
  padding: 50px 0;
  font-size: 1.1em;
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
