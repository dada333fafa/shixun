<template>
  <div class="register-container">
    <div class="register-box">
      <h1 class="title">乡村助学平台</h1>
      <h2 class="subtitle">管理员注册</h2>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="registerForm.username" 
            placeholder="请输入用户名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="name">真实姓名</label>
          <input 
            type="text" 
            id="name" 
            v-model="registerForm.name" 
            placeholder="请输入真实姓名"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="registerForm.email" 
            placeholder="请输入邮箱"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="phone">手机号</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="registerForm.phone" 
            placeholder="请输入手机号"
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="registerForm.password" 
            placeholder="请输入密码（至少6位）"
            required
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="registerForm.confirmPassword" 
            placeholder="请再次输入密码"
            required
          />
        </div>
        
        <div class="error-message" v-if="errorMessage">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="btn-register" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const registerForm = ref({
  username: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const errorMessage = ref('')
const loading = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致'
    return
  }
  
  loading.value = true
  
  try {
    const response = await axios.post('/api/auth/register', {
      username: registerForm.value.username,
      name: registerForm.value.name,
      email: registerForm.value.email,
      phone: registerForm.value.phone,
      password: registerForm.value.password,
      role: 'admin'
    })
    
    if (response.data.success) {
      alert('注册成功！请登录')
      router.push('/login')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || '注册失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #9C27B0, #7B1FA2);
  padding: 20px;
}

.register-box {
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
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

.btn-register {
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

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(156, 39, 176, 0.3);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #9C27B0;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
