<template>
  <div class="login-container">
    <div class="login-box">
      <h1>乡村助学平台</h1>
      <h2>用户登录</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
            required
          >
        </div>
        
        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="login-links">
        <router-link to="/register">还没有账号？立即注册</router-link>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/utils/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')

const loginForm = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const result = await loginUser(loginForm)
    
    // 根据用户角色跳转到不同页面
    if (result.user && result.user.role === 'student') {
      router.push('/student/dashboard')
    } else if (result.user && result.user.role === 'teacher') {
      // 暂时也跳转到学生仪表盘，后续可以添加教师端页面
      alert('教师端功能开发中，请先使用学生账号登录')
      router.push('/login')
    } else {
      router.push('/student/dashboard')
    }
  } catch (err) {
    error.value = err.message || '登录失败，请检查用户名和密码'
    console.error('登录错误:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.login-box h1 {
  text-align: center;
  color: #4CAF50;
  margin-bottom: 10px;
  font-size: 1.8em;
}

.login-box h2 {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 1.3em;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login:hover:not(:disabled) {
  background: #45a049;
  transform: translateY(-2px);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-links {
  text-align: center;
  margin-top: 20px;
}

.login-links a {
  color: #4CAF50;
  text-decoration: none;
}

.login-links a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background: #ffebee;
  color: #c62828;
  border-radius: 5px;
  text-align: center;
}
</style>
