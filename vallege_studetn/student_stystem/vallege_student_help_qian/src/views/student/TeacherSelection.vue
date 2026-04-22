<template>
  <div class="container">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <h2>学生中心</h2>
      <nav class="nav-menu">
        <router-link to="/student/dashboard">仪表盘</router-link>
        <router-link to="/student/teacher-selection" class="active">教师选择</router-link>
        <router-link to="/student/chat">聊天沟通</router-link>
        <router-link to="/student/resources">学习资源</router-link>
        <router-link to="/student/psychological">心理支持</router-link>
        <router-link to="/student/ai-recommendation">AI推荐</router-link>
        <router-link to="/student/match">匹配管理</router-link>
        <a href="#" @click.prevent="handleLogout">退出登录</a>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="header">
        <h1>教师选择</h1>
        <div class="user-info">
          <span>欢迎，{{ currentUser?.name || currentUser?.username }}</span>
          <div class="user-avatar">{{ (currentUser?.name || currentUser?.username || '用').charAt(0) }}</div>
        </div>
      </header>

      <!-- 搜索和筛选 -->
      <div class="search-filter">
        <div class="search-bar">
          <input 
            type="text" 
            v-model="searchKeyword" 
            @input="filterTeachers"
            placeholder="搜索教师姓名或科目"
          >
          <button @click="filterTeachers">搜索</button>
        </div>
        <div class="filters">
          <div class="filter-item">
            <label>科目</label>
            <select v-model="subjectFilter" @change="filterTeachers">
              <option value="">全部科目</option>
              <option value="math">数学</option>
              <option value="chinese">语文</option>
              <option value="english">英语</option>
              <option value="physics">物理</option>
              <option value="chemistry">化学</option>
              <option value="biology">生物</option>
            </select>
          </div>
          <div class="filter-item">
            <label>教学经验</label>
            <select v-model="experienceFilter" @change="filterTeachers">
              <option value="">全部经验</option>
              <option value="1-3">1-3年</option>
              <option value="3-5">3-5年</option>
              <option value="5+">5年以上</option>
            </select>
          </div>
          <div class="filter-item">
            <label>年级</label>
            <select v-model="gradeFilter" @change="filterTeachers">
              <option value="">全部年级</option>
              <option value="primary">小学</option>
              <option value="middle">初中</option>
              <option value="high">高中</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 教师列表 -->
      <div class="teacher-list">
        <div 
          v-for="teacher in filteredTeachers" 
          :key="teacher.id"
          class="teacher-card"
        >
          <div class="teacher-header">
            <div class="teacher-avatar">{{ getTeacherInitials(teacher) }}</div>
            <div class="teacher-info">
              <h3>{{ teacher.name || teacher.username }}</h3>
              <div class="teacher-subject">{{ getSubjectNames(teacher) }}</div>
            </div>
          </div>
          <div class="teacher-details">
            <p>🎓 教育背景：{{ teacher.detail?.education || '暂未填写' }}</p>
            <p>📚 教学经验：{{ teacher.detail?.experience || '暂未填写' }}</p>
            <p>📍 联系电话：{{ teacher.phone || '未提供' }}</p>
          </div>
          <div v-if="getSubjectNames(teacher)" class="teacher-skills">
            <span 
              v-for="(subject, index) in getSubjectsArray(teacher)" 
              :key="index"
              class="skill-tag"
            >
              {{ subject }}
            </span>
          </div>
          <button class="btn-request" @click="requestTeacher(teacher)">
            发送辅导请求
          </button>
        </div>

        <div v-if="filteredTeachers.length === 0" class="no-results">
          没有找到匹配的教师
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentUser, getTeachers, sendMatchRequest } from '@/utils/api'

const router = useRouter()
const currentUser = ref(null)
const allTeachers = ref([])
const filteredTeachers = ref([])

const searchKeyword = ref('')
const subjectFilter = ref('')
const experienceFilter = ref('')
const gradeFilter = ref('')

onMounted(async () => {
  try {
    currentUser.value = await getCurrentUser()
    await loadTeachers()
  } catch (error) {
    console.error('初始化页面失败:', error)
    alert('加载页面失败，请重新登录')
    router.push('/login')
  }
})

async function loadTeachers() {
  try {
    const teachers = await getTeachers()
    allTeachers.value = teachers
    filteredTeachers.value = [...teachers]
  } catch (error) {
    console.error('加载教师列表失败:', error)
    alert('加载教师列表失败: ' + error.message)
  }
}

function filterTeachers() {
  const keyword = searchKeyword.value.toLowerCase().trim()
  
  filteredTeachers.value = allTeachers.value.filter(teacher => {
    const teacherName = (teacher.name || teacher.username || '').toLowerCase()
    
    // 处理科目
    const subjectStr = teacher.detail?.subject || ''
    const subjects = subjectStr ? subjectStr.split(/[,、]/) : []
    const subjectNames = subjects.map(s => s.trim()).filter(s => s).join('')
    
    // 解析经验年数
    const expStr = teacher.detail?.experience || '0'
    const expMatch = expStr.match(/(\d+)/)
    const experience = expMatch ? parseInt(expMatch[1]) : 0
    
    // 关键词搜索
    if (keyword && !teacherName.includes(keyword) && !subjectNames.includes(keyword)) {
      return false
    }
    
    // 科目筛选
    if (subjectFilter.value) {
      const subjectMap = {
        'math': '数学',
        'chinese': '语文',
        'english': '英语',
        'physics': '物理',
        'chemistry': '化学',
        'biology': '生物'
      }
      const chineseSubject = subjectMap[subjectFilter.value] || subjectFilter.value
      if (!subjectNames.includes(chineseSubject)) {
        return false
      }
    }
    
    // 经验筛选
    if (experienceFilter.value) {
      if (experienceFilter.value === '1-3' && (experience < 1 || experience > 3)) return false
      if (experienceFilter.value === '3-5' && (experience < 3 || experience > 5)) return false
      if (experienceFilter.value === '5+' && experience < 5) return false
    }
    
    return true
  })
}

function getTeacherInitials(teacher) {
  const name = teacher.name || teacher.username || '教'
  return name.charAt(0)
}

function getSubjectNames(teacher) {
  const subjectStr = teacher.detail?.subject || ''
  const subjects = subjectStr ? subjectStr.split(/[,、]/) : []
  return subjects.map(s => s.trim()).filter(s => s).join('、')
}

function getSubjectsArray(teacher) {
  const subjectStr = teacher.detail?.subject || ''
  return subjectStr ? subjectStr.split(/[,、]/).map(s => s.trim()).filter(s => s) : []
}

async function requestTeacher(teacher) {
  try {
    const teacherName = teacher.name || teacher.username
    const teacherUserId = teacher.user_id || teacher.id
    
    console.log('准备发送辅导请求:', {
      teacherId: teacherUserId,
      teacherName: teacherName,
      teacherData: teacher
    })
    
    if (!confirm(`确定要向${teacherName}发送辅导请求吗？`)) {
      return
    }
    
    const message = prompt('请输入辅导需求描述（可选）：') || ''
    
    console.log('调用 sendMatchRequest, teacherUserId:', teacherUserId)
    const result = await sendMatchRequest(teacherUserId, message)
    console.log('发送请求成功:', result)
    
    alert(result.msg || '辅导请求已发送，请等待老师确认')
    
    // 跳转到匹配管理页面
    router.push('/student/match')
  } catch (error) {
    console.error('发送请求失败:', error)
    alert('发送请求失败: ' + error.message)
  }
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
  font-size: 1.5em;
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
  padding: 20px 20px 20px 0;
  overflow-y: auto;
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
  color: #4CAF50;
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
  background: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.search-filter {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
}

.search-bar button {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-bar button:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.filters {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
}

.filter-item label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.filter-item select {
  padding: 8px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
}

.teacher-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.teacher-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.teacher-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.teacher-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.teacher-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #E8F5E8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
  font-size: 1.5em;
  font-weight: bold;
}

.teacher-info h3 {
  color: #4CAF50;
  margin-bottom: 5px;
}

.teacher-subject {
  font-size: 0.9em;
  color: #666;
}

.teacher-details {
  margin-bottom: 15px;
}

.teacher-details p {
  margin-bottom: 5px;
  font-size: 0.9em;
}

.teacher-skills {
  margin-bottom: 15px;
}

.skill-tag {
  display: inline-block;
  padding: 5px 10px;
  background: #E8F5E8;
  color: #4CAF50;
  border-radius: 15px;
  font-size: 0.8em;
  margin-right: 5px;
  margin-bottom: 5px;
}

.btn-request {
  width: 100%;
  padding: 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-request:hover {
  background: #45a049;
  transform: translateY(-2px);
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #999;
  grid-column: 1 / -1;
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
  
  .filters {
    flex-direction: column;
  }
  
  .teacher-list {
    grid-template-columns: 1fr;
  }
}
</style>
