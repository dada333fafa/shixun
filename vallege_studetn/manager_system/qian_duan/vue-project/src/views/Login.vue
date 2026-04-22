<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="title">乡村助学平台</h1>
      <h2 class="subtitle">管理员登录</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="loginForm.password" 
            placeholder="请输入密码"
            required
          />
        </div>
        
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      
      <div class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const loginForm = ref({
  username: '',
  password: ''
})
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    const response = await axios.post('/api/auth/login', loginForm.value)
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      router.push('/dashboard')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '登录失败，请检查用户名和密码'
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
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
  padding: 20px;
}

.login-box {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 450px;
}

.title {
  color: #9C27B0;
  text-align: center;
  font-size: 2em;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  text-align: center;
  font-size: 1.3em;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #9C27B0;
}

.error-message {
  color: #f44336;
  background-color: #ffebee;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  text-align: center;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(156, 39, 176, 0.3);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #9C27B0;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
