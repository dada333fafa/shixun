<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">🎓</div>
      <h1>登录乡村助学平台</h1>
      
      <form @submit.prevent="handleLogin">
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            placeholder="请输入用户名"
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            placeholder="请输入密码"
          >
        </div>
        
        <div class="role-selection">
          <label>选择角色</label>
          <div class="role-options">
            <div 
              v-for="role in roles" 
              :key="role.value"
              class="role-option"
              :class="{ selected: selectedRole === role.value }"
              @click="selectRole(role.value)"
            >
              <i>{{ role.icon }}</i>
              <span>{{ role.label }}</span>
            </div>
          </div>
        </div>
        
        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <div class="links">
          <router-link to="/forgot-password">忘记密码</router-link>
          <router-link to="/">返回首页</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../../api'

const router = useRouter()

const form = reactive({
  username: '',
  password: ''
})

const selectedRole = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const roles = [
  { value: 'admin', icon: '🔧', label: '管理员' }
]

const selectRole = (role) => {
  selectedRole.value = role
}

const handleLogin = async () => {
  console.log('登录函数被调用')
  errorMessage.value = ''
  
  console.log('表单数据:', form)
  console.log('选择角色:', selectedRole.value)
  
  if (!form.username || !form.password) {
    errorMessage.value = '请输入用户名和密码'
    console.log('验证失败：缺少用户名或密码')
    return
  }
  
  if (!selectedRole.value) {
    errorMessage.value = '请选择角色'
    console.log('验证失败：未选择角色')
    return
  }
  
  try {
    loading.value = true
    console.log('开始发送登录请求...')
    const response = await authAPI.login({
      username: form.username,
      password: form.password,
      role: selectedRole.value
    })
    
    console.log('登录响应:', response)
    
    const result = response.data
    console.log('登录数据:', result)
    
    if (result.status === 'success' && result.data.token) {
      // 保存Token到localStorage
      localStorage.setItem('token', result.data.token)
      
      // 保存用户信息到localStorage
      localStorage.setItem('user', JSON.stringify(result.data.user))
      
      console.log('Token已保存:', result.data.token)
      
      // 根据角色跳转到相应的仪表盘
      const routes = {
        admin: '/admin/dashboard'
      }
      
      console.log('登录成功，跳转到:', routes[selectedRole.value])
      router.push(routes[selectedRole.value])
    } else {
      errorMessage.value = result.message || '登录失败'
      console.log('登录失败:', result.message)
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '登录失败，请稍后重试'
    console.error('登录错误:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-card {
  max-width: 500px;
  width: 100%;
  padding: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  text-align: center;
}

h1 {
  color: #4CAF50;
  margin-bottom: 30px;
  font-size: 2em;
}

.logo {
  font-size: 4em;
  margin-bottom: 20px;
  color: #4CAF50;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.role-selection {
  margin: 20px 0;
}

.role-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 10px;
}

.role-option {
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.role-option:hover {
  border-color: #4CAF50;
  background-color: #f9fff9;
}

.role-option.selected {
  border-color: #4CAF50;
  background-color: #e8f5e8;
}

.role-option i {
  font-size: 2em;
  margin-bottom: 10px;
  display: block;
}

.btn-login {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.links {
  margin-top: 20px;
  font-size: 0.9em;
}

.links a {
  color: #4CAF50;
  text-decoration: none;
  margin: 0 10px;
}

.links a:hover {
  text-decoration: underline;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #ef9a9a;
}

@media (max-width: 768px) {
  .login-card {
    padding: 20px;
  }
  
  .role-options {
    grid-template-columns: 1fr;
  }
}
</style>
