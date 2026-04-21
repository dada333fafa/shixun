<template>
  <div class="register-container">
    <div class="register-card">
      <div class="logo">🎓</div>
      <h1>注册乡村助学平台</h1>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            placeholder="请输入用户名"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            placeholder="请输入密码"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="form.confirmPassword" 
            placeholder="请确认密码"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="name">真实姓名</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            placeholder="请输入真实姓名"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            placeholder="请输入邮箱"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="phone">电话</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="form.phone" 
            placeholder="请输入电话"
            required
          >
        </div>
        
        <div class="role-selection">
          <label>选择角色</label>
          <div class="role-options">
            <div 
              v-for="role in roles" 
              :key="role.value"
              class="role-option"
              :class="{ selected: form.role === role.value }"
              @click="form.role = role.value"
            >
              <i>{{ role.icon }}</i>
              <span>{{ role.label }}</span>
            </div>
          </div>
        </div>
        
        <button type="submit" class="btn-register" :disabled="loading">
          <span v-if="!loading">注册</span>
          <span v-else class="loading"></span>
        </button>
        
        <div class="links">
          <router-link to="/login">已有账号？立即登录</router-link>
          <router-link to="/">返回首页</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '@/utils/api'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  email: '',
  phone: '',
  role: ''
})

const roles = [
  { value: 'teacher', icon: '👩‍🏫', label: '教育教师' },
  { value: 'student', icon: '👨‍🎓', label: '儿童/学生' },
  { value: 'parent', icon: '👨‍👩‍👧‍👦', label: '家长/监护人' },
  { value: 'admin', icon: '🔧', label: '管理员' }
]

const handleRegister = async () => {
  // 验证表单
  if (!form.username || !form.password || !form.confirmPassword || 
      !form.name || !form.email || !form.phone) {
    alert('请填写所有必填字段')
    return
  }
  
  if (form.password !== form.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  if (!form.role) {
    alert('请选择角色')
    return
  }
  
  try {
    loading.value = true
    
    const userData = {
      username: form.username,
      password: form.password,
      role: form.role,
      name: form.name,
      email: form.email,
      phone: form.phone
    }
    
    await registerUser(userData)
    
    alert('注册成功！请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    alert(error.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f8ff;
  padding: 20px;
}

.register-card {
  max-width: 500px;
  width: 100%;
  background: white;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  text-align: center;
}

.logo {
  font-size: 4em;
  margin-bottom: 20px;
  color: #4CAF50;
}

h1 {
  color: #4CAF50;
  margin-bottom: 30px;
  font-size: 2em;
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
input[type="password"],
input[type="email"],
input[type="tel"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="email"]:focus,
input[type="tel"]:focus {
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
  font-style: normal;
}

.btn-register {
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

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
}

.btn-register:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.loading {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .register-container {
    padding: 10px;
  }
  
  .register-card {
    padding: 20px;
  }
  
  .role-options {
    grid-template-columns: 1fr;
  }
}
</style>
