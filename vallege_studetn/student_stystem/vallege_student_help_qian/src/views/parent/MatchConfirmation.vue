<template>
  <div>
    <div class="match-list">
      <div v-if="matches.length === 0" class="no-matches">
        <p>暂无待确认的辅导匹配请求</p>
      </div>
      
      <div v-for="match in matches" :key="match._id" class="match-item">
        <div class="match-item-header">
          <div class="match-item-title">辅导请求 - 学生（{{ match.status }}）</div>
          <span class="match-item-status" :class="getStatusClass(match.status)">{{ getStatusText(match.status) }}</span>
        </div>
        <div class="match-item-details">
          <p>📝 辅导科目：{{ match.teacher_id?.subject || '未知科目' }}</p>
          <p>🎯 学习需求：{{ match.request_message || '暂无说明' }}</p>
          <p>⏰ 申请时间：{{ match.created_at ? formatTime(match.created_at) : '未知' }}</p>
          <p>👨‍👩‍👧‍👦 家长审批：{{ match.parent_approval ? '已确认' : '未确认' }}</p>
        </div>
        <div class="match-item-actions" v-if="match.status === 'pending' && !match.parent_approval">
          <button class="btn btn-primary" @click="approveRequest(match._id)">同意</button>
          <button class="btn btn-secondary" @click="rejectRequest(match._id)">拒绝</button>
        </div>
        <div class="match-item-actions" v-else>
          <span class="status-text" :class="getStatusClass(match.status)">
            {{ match.parent_approval ? '已确认' : '状态：' + getStatusText(match.status) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get, post } from '../api/config.js'

export default {
  name: 'ParentMatchConfirmation',
  data() {
    return {
      matches: []
    }
  },
  computed: {
    parentId() {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        return user._id
      }
      return null
    }
  },
  mounted() {
    this.fetchMatches()
  },
  methods: {
    async fetchMatches() {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      try {
        console.log('获取匹配请求，家长ID:', this.parentId)
        const response = await get(`/match-confirmation/${this.parentId}`)
        console.log('匹配请求响应:', response)
        if (response.success) {
          this.matches = response.matches
          console.log('匹配请求数据:', this.matches)
        } else {
          console.error('获取匹配请求失败:', response.message)
          alert('获取匹配请求失败: ' + response.message)
        }
      } catch (error) {
        console.error('获取匹配请求失败:', error)
        alert('获取匹配请求失败: ' + error.message)
      }
    },
    async approveRequest(matchId) {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      if (confirm('确定要同意这个辅导请求吗？')) {
        try {
          const response = await post('/match/approve', {
            matchId,
            parentId: this.parentId
          })
          if (response.success) {
            alert('已同意辅导请求')
            this.fetchMatches()
          } else {
            alert('操作失败：' + response.message)
          }
        } catch (error) {
          console.error('同意请求失败:', error)
          alert('操作失败')
        }
      }
    },
    async rejectRequest(matchId) {
      if (!this.parentId) {
        console.error('家长ID不存在，请重新登录')
        alert('家长ID不存在，请重新登录')
        return
      }
      
      if (confirm('确定要拒绝这个辅导请求吗？')) {
        try {
          const response = await post('/match/reject', {
            matchId,
            parentId: this.parentId
          })
          if (response.success) {
            alert('已拒绝辅导请求')
            this.fetchMatches()
          } else {
            alert('操作失败：' + response.message)
          }
        } catch (error) {
          console.error('拒绝请求失败:', error)
          alert('操作失败')
        }
      }
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待家长确认',
        'approved': '已同意',
        'rejected': '已拒绝',
        'active': '进行中',
        'completed': '已完成'
      }
      return statusMap[status] || status
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
    },
    getStatusClass(status) {
      const statusMap = {
        'pending': 'status-pending',
        'approved': 'status-approved',
        'rejected': 'status-rejected',
        'active': 'status-active',
        'completed': 'status-completed'
      }
      return statusMap[status] || ''
    }
  }
}
</script>

<style scoped>
.match-list {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.no-matches {
  text-align: center;
  padding: 40px;
  color: #666;
}

.match-item {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.match-item:hover {
  background-color: #f9f9f9;
}

.match-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.match-item-title {
  font-weight: bold;
  font-size: 1.1em;
}

.match-item-status {
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 0.8em;
  font-weight: bold;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-approved {
  background-color: #d4edda;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}

.status-active {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background-color: #e2e3e5;
  color: #383d41;
}

.match-item-details {
  margin-bottom: 15px;
}

.match-item-details p {
  margin-bottom: 5px;
  font-size: 0.9em;
}

.teacher-info {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.teacher-info h4 {
  margin-bottom: 10px;
  color: #FF9800;
}

.match-item-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.status-text {
  color: #666;
  font-style: italic;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  font-size: 0.9em;
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

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #bdbdbd;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .match-item-actions {
    flex-direction: column;
  }
}
</style>
