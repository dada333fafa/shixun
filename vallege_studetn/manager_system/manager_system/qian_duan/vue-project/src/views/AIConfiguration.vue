<template>
  <div class="container">
    <Sidebar />
    <div class="main-content">
      <div class="header">
        <h1>AI配置</h1>
        <div class="user-info">
          <span>欢迎，{{ userName }}</span>
          <div class="user-avatar">{{ userInitial }}</div>
        </div>
      </div>
      
      <div class="ai-tabs">
        <div class="tabs">
          <div v-for="tab in tabs" :key="tab.id" :class="['tab', { active: activeTab === tab.id }]" @click="activeTab = tab.id">{{ tab.name }}</div>
        </div>
      </div>
      
      <!-- 匹配规则 -->
      <div class="config-section" v-if="activeTab === 'rules'">
        <h3>匹配规则配置</h3>
        <div class="config-grid">
          <div class="config-group">
            <label>科目匹配权重</label>
            <input type="range" v-model="config.subjectWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.subjectWeight }}%</div>
          </div>
          <div class="config-group">
            <label>年级匹配权重</label>
            <input type="range" v-model="config.gradeWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.gradeWeight }}%</div>
          </div>
          <div class="config-group">
            <label>教师经验权重</label>
            <input type="range" v-model="config.experienceWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.experienceWeight }}%</div>
          </div>
          <div class="config-group">
            <label>教师评分权重</label>
            <input type="range" v-model="config.ratingWeight" min="0" max="100" class="slider">
            <div class="value">当前值: {{ config.ratingWeight }}%</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button class="btn btn-primary" @click="saveConfig">保存配置</button>
        <button class="btn btn-secondary" @click="testConfig">测试配置</button>
        <button class="btn btn-secondary" @click="resetConfig">恢复默认</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import axios from 'axios'

const userName = ref('管理员')
const userInitial = ref('管')
const activeTab = ref('rules')
const tabs = [
  { id: 'rules', name: '匹配规则' }
]
const config = ref({
  subjectWeight: 80,
  gradeWeight: 70,
  experienceWeight: 60,
  ratingWeight: 50
})


onMounted(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (user.name) {
    userName.value = user.name
    userInitial.value = user.name.charAt(0)
  }
  loadConfig()
})

const loadConfig = async () => {
  try {
    const response = await axios.get('/api/ai-config')
    if (response.data.config) {
      Object.assign(config.value, response.data.config)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

const saveConfig = async () => {
  try {
    await axios.put('/api/ai-config', config.value)
    alert('配置保存成功')
  } catch (error) {
    alert('保存失败')
  }
}

const testConfig = () => alert('测试配置功能待实现')
const resetConfig = () => {
  config.value = {
    subjectWeight: 80,
    gradeWeight: 70,
    experienceWeight: 60,
    ratingWeight: 50
  }
}

</script>

<style scoped>
.container { display: flex; min-height: 100vh; }
.main-content { flex: 1; padding: 20px; }
.header { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
.header h1 { color: #9C27B0; font-size: 1.8em; }
.user-info { display: flex; align-items: center; gap: 10px; }
.user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #9C27B0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
.ai-tabs { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
.tabs { display: flex; gap: 20px; margin-bottom: 20px; }
.tab { padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; font-weight: bold; }
.tab.active { background-color: #9C27B0; color: white; }
.tab:hover { background-color: #f0f0f0; }
.config-section { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
.config-section h3 { color: #9C27B0; margin-bottom: 20px; font-size: 1.3em; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.config-group { margin-bottom: 20px; }
.config-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
.config-group input, .config-group select { width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 5px; font-size: 1em; }
.config-group .slider { width: 100%; height: 8px; border-radius: 5px; background: #e0e0e0; outline: none; -webkit-appearance: none; }
.config-group .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #9C27B0; cursor: pointer; }
.config-group .value { margin-top: 5px; font-size: 0.9em; color: #666; }
.checkbox-group { display: flex; align-items: center; gap: 10px; }
.checkbox-group input[type="checkbox"] { width: auto; }
.btn { padding: 10px 20px; border: none; border-radius: 5px; font-size: 1em; font-weight: bold; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: #9C27B0; color: white; }
.btn-primary:hover { background: #7B1FA2; transform: translateY(-2px); }
.btn-secondary { background: #e0e0e0; color: #333; }
.btn-secondary:hover { background: #bdbdbd; transform: translateY(-2px); }
.action-buttons { display: flex; gap: 10px; margin-top: 20px; }

@media (max-width: 768px) { .container { flex-direction: column; } .sidebar { width: 100%; padding: 10px; } .nav-menu { display: flex; overflow-x: auto; gap: 10px; } .nav-menu li { margin-bottom: 0; } .tabs { overflow-x: auto; flex-wrap: nowrap; } .config-grid { grid-template-columns: 1fr; } }
</style>
