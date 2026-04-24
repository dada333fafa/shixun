<template>
  <div class="container">
    <Sidebar />
    
    <div class="main-content">
      <div class="header">
        <h1>管理员仪表盘</h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="dashboard-cards">
        <div class="card">
          <div class="card-icon">👨‍🏫</div>
          <h3>教师数量</h3>
          <div class="card-value">{{ stats.teachers }}</div>
          <p>总计 {{ stats.teachers }} 名</p>
        </div>
        
        <div class="card">
          <div class="card-icon">👨‍🎓</div>
          <h3>学生数量</h3>
          <div class="card-value">{{ stats.students }}</div>
          <p>总计 {{ stats.students }} 名</p>
        </div>
        
        <div class="card">
          <div class="card-icon">👨‍👩‍👧‍👦</div>
          <h3>家长数量</h3>
          <div class="card-value">{{ stats.parents }}</div>
          <p>总计 {{ stats.parents }} 名</p>
        </div>
        
        <div class="card">
          <div class="card-icon">🔧</div>
          <h3>管理员数量</h3>
          <div class="card-value">{{ stats.admins }}</div>
          <p>总计 {{ stats.admins }} 名</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import { adminAPI } from '../api'

const userName = ref('管理员')
const userInitial = ref('管')
const stats = ref({
  teachers: 0,
  students: 0,
  parents: 0,
  admins: 0,
  total: 0
})

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.name) {
    userName.value = user.name
    userInitial.value = user.name.charAt(0)
  }
  
  // 获取系统统计信息
  try {
    const response = await adminAPI.getStats()
    if (response.data.status === 'success') {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
})
</script>

<style scoped>
.container {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.header {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  color: #9C27B0;
  font-size: 1.8em;
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
  background: #9C27B0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.card h3 {
  color: #9C27B0;
  margin-bottom: 15px;
  font-size: 1.2em;
}

.card-icon {
  font-size: 2.5em;
  margin-bottom: 15px;
  color: #9C27B0;
}

.card-value {
  font-size: 2em;
  font-weight: bold;
  color: #333;
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
  
  .nav-menu li {
    margin-bottom: 0;
  }
  
  .dashboard-cards {
    grid-template-columns: 1fr;
  }
}
</style>
