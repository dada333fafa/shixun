<template>
  <div>
    <!-- 添加孩子表单 -->
    <div class="add-child">
      <h2>添加孩子</h2>
      <form @submit.prevent="addChild">
        <div class="form-group">
          <label for="child-name">孩子姓名（必须是真实注册的学生）</label>
          <input 
            type="text" 
            id="child-name" 
            v-model="newChild.studentName" 
            placeholder="请输入真实存在的学生姓名" 
            required
          >
        </div>
        <div class="form-group">
          <label for="child-message">请求消息（可选）</label>
          <textarea 
            id="child-message" 
            v-model="newChild.message" 
            placeholder="请输入请求消息，例如：我是你的家长，请接受我的请求"
            rows="3"
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary">发送添加请求</button>
      </form>
    </div>
    
    <!-- 待处理请求列表 -->
    <div class="pending-requests" v-if="pendingRequests.length > 0">
      <h2>待处理的请求</h2>
      <table>
        <thead>
          <tr>
            <th>学生姓名</th>
            <th>请求消息</th>
            <th>发送时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in pendingRequests" :key="request._id">
            <td>{{ request.student?.user?.name || '未知' }}</td>
            <td>{{ request.message || '无' }}</td>
            <td>{{ formatDate(request.createdAt) }}</td>
            <td><span class="status-badge status-pending">等待学生确认</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 已添加的孩子列表 -->
    <div class="child-list">
      <h2>我的孩子</h2>
      <table v-if="children.length > 0">
        <thead>
          <tr>
            <th>孩子姓名</th>
            <th>年级</th>
            <th>学校</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="child in children" :key="child._id">
            <td>{{ child.user_id?.name || '未知' }}</td>
            <td>{{ child.grade || '未填写' }}</td>
            <td>{{ child.school || '未填写' }}</td>
            <td><span class="status-badge status-active">已添加</span></td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">
        <p>暂无已添加的孩子</p>
      </div>
    </div>
  </div>
</template>

<script>
import { get, post } from '../api/config.js'

export default {
  name: 'ParentChildManagement',
  data() {
    return {
      children: [],
      pendingRequests: [],
      newChild: {
        studentName: '',
        message: ''
      }
    }
  },
  computed: {
    parentId() {
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
    this.fetchPendingRequests()
  },
  methods: {
    async fetchChildren() {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      try {
        const response = await get(`/parents/children/${this.parentId}`)
        if (response.success) {
          this.children = response.children
        }
      } catch (error) {
        console.error('获取孩子列表失败:', error)
      }
    },
    async fetchPendingRequests() {
      if (!this.parentId) {
        return
      }
      
      try {
        const response = await get(`/parents/children/pending/${this.parentId}`)
        if (response.success) {
          this.pendingRequests = response.requests
        }
      } catch (error) {
        console.error('获取待处理请求失败:', error)
      }
    },
    async addChild() {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      if (!this.newChild.studentName.trim()) {
        alert('请输入学生姓名')
        return
      }
      
      try {
        const response = await post('/parents/children/add', {
          parentId: this.parentId,
          studentName: this.newChild.studentName.trim(),
          message: this.newChild.message
        })
        
        if (response.success) {
          alert('请求已发送，等待学生确认！')
          this.fetchPendingRequests()
          this.newChild = { studentName: '', message: '' }
        } else {
          alert('发送请求失败：' + response.message)
        }
      } catch (error) {
        console.error('发送请求失败:', error)
        alert('发送请求失败: ' + error.message)
      }
    },
    formatDate(dateString) {
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
.add-child,
.pending-requests,
.child-list {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.add-child h2,
.pending-requests h2,
.child-list h2 {
  color: #FF9800;
  margin-bottom: 20px;
  font-size: 1.5em;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
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
  transform: translateY(-2px);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

th {
  background: #f5f5f5;
  font-weight: bold;
  color: #333;
}

tr:hover {
  background: #f9f9f9;
}

.status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

@media (max-width: 768px) {
  table {
    font-size: 14px;
  }
  
  th, td {
    padding: 10px;
  }
}
</style>
