<template>
  <div>
    <!-- 收到的请求 - 待处理 -->
    <div class="match-section">
      <h3 class="section-title">📬 收到的请求</h3>
      <div v-if="pendingMatches.length === 0" class="no-matches">
        <p>暂无待确认的辅导匹配请求</p>
      </div>
      
      <div v-for="match in pendingMatches" :key="match._id" class="match-item">
        <div class="match-item-header">
          <div class="match-item-title">
            辅导请求 - {{ getStudentName(match) }} → {{ getTeacherName(match) }}
          </div>
          <span class="match-item-status" :class="getStatusClass(match)">{{ getStatusText(match) }}</span>
        </div>
        
        <div class="match-item-details">
          <p>👨‍🎓 学生：{{ getStudentName(match) }}</p>
          <p>👨‍🏫 教师：{{ getTeacherName(match) }}</p>
          <p>📝 辅导需求：{{ match.requestMessage || '暂无说明' }}</p>
          <p>⏰ 申请时间：{{ match.createdAt ? formatTime(match.createdAt) : '未知' }}</p>
          <p>👨‍‍👦 家长审批：{{ match.parentApproval ? '已同意' : '未确认' }}</p>
        </div>
        
        <div class="match-item-actions" v-if="!match.parentApproval">
          <button class="btn btn-primary" @click="approveRequest(match._id)">同意</button>
          <button class="btn btn-secondary" @click="rejectRequest(match._id)">拒绝</button>
        </div>
      </div>
    </div>

    <!-- 已操作的请求 - 已处理 -->
    <div class="match-section">
      <h3 class="section-title">✅ 已操作的请求</h3>
      <div v-if="processedMatches.length === 0" class="no-matches">
        <p>暂无已处理的请求</p>
      </div>
      
      <div v-for="match in processedMatches" :key="match._id" class="match-item processed">
        <div class="match-item-header">
          <div class="match-item-title">
            辅导请求 - {{ getStudentName(match) }} → {{ getTeacherName(match) }}
          </div>
          <span class="match-item-status" :class="getStatusClass(match)">{{ getStatusText(match) }}</span>
        </div>
        
        <div class="match-item-details">
          <p>👨‍🎓 学生：{{ getStudentName(match) }}</p>
          <p>👨‍🏫 教师：{{ getTeacherName(match) }}</p>
          <p>📝 辅导需求：{{ match.requestMessage || '暂无说明' }}</p>
          <p>⏰ 申请时间：{{ match.createdAt ? formatTime(match.createdAt) : '未知' }}</p>
          <p v-if="match.matchedAt">✅ 确认时间：{{ formatTime(match.matchedAt) }}</p>
          <p>👨‍👩‍👦 家长审批：{{ match.parentApproval ? '已同意' : '已拒绝' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { get, put } from '../api/config.js'

export default {
  name: 'ParentMatchConfirmation',
  data() {
    return {
      matches: [],
      pendingMatches: [],    // 待处理的请求
      processedMatches: []   // 已处理的请求
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
        const response = await get('/matches/parent/pending')
        console.log('匹配请求响应:', response)
        if (response.success) {
          this.matches = response.matches
          console.log('匹配请求数据:', this.matches)
          
          // 分类：待处理和已处理
          this.pendingMatches = this.matches.filter(match => !match.parentApproval && match.status !== 'rejected')
          this.processedMatches = this.matches.filter(match => match.parentApproval || match.status === 'rejected')
          
          console.log('待处理请求:', this.pendingMatches.length)
          console.log('已处理请求:', this.processedMatches.length)
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
          console.log('家长同意请求, matchId:', matchId)
          const response = await put(`/matches/${matchId}/parent-approve`, {})
          console.log('同意响应:', response)
          if (response.success) {
            alert(response.message || '已同意辅导请求')
            this.fetchMatches()
          } else {
            alert('操作失败：' + response.message)
          }
        } catch (error) {
          console.error('同意请求失败:', error)
          alert('操作失败: ' + error.message)
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
          console.log('家长拒绝请求, matchId:', matchId)
          const response = await put(`/matches/${matchId}/parent-reject`, {})
          console.log('拒绝响应:', response)
          if (response.success) {
            alert(response.message || '已拒绝辅导请求')
            this.fetchMatches()
          } else {
            alert('操作失败：' + response.message)
          }
        } catch (error) {
          console.error('拒绝请求失败:', error)
          alert('操作失败: ' + error.message)
        }
      }
    },
    getStatusText(match) {
      if (match.status === 'pending' && !match.parentApproval) {
        return '待您和教师确认';
      } else if (match.status === 'pending' && match.parentApproval) {
        return '家长已同意，等待教师审批';
      } else if (match.status === 'approved' && !match.parentApproval) {
        return '教师已同意，待您确认';
      } else if (match.status === 'approved' && match.parentApproval) {
        return '已同意（待教师确认）';
      } else if (match.status === 'active') {
        return '已接收';  // 修改：双方都同意后显示“已接收”
      } else if (match.status === 'rejected') {
        if (match.parentApproval) {
          return '家长已同意，但教师已拒绝';
        }
        return '已拒绝';
      } else if (match.status === 'completed') {
        return '已完成';
      }
      return match.status;
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
    getStatusClass(match) {
      if (match.status === 'rejected') return 'status-rejected';
      if (match.status === 'active') return 'status-active';
      if (match.status === 'completed') return 'status-completed';
      if (match.parentApproval && match.status === 'approved') return 'status-approved';
      return 'status-pending';
    },
    getStudentName(match) {
      if (!match.student) return '未知学生';
      const user = match.student.user || match.student;
      return user.name || '未知学生';
    },
    getTeacherName(match) {
      if (!match.teacher) return '未知教师';
      const user = match.teacher.user || match.teacher;
      return user.name || '未知教师';
    },
  }
}
</script>

<style scoped>
.match-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3em;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
  color: #333;
}

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
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  background: white;
}

.match-item:hover {
  background-color: #f9f9f9;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.match-item.processed {
  background-color: #f5f5f5;
  opacity: 0.9;
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
