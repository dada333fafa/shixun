<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <div class="logo">🔒</div>
      <h1>忘记密码</h1>
      <p>请输入您的邮箱,我们将发送重置密码的链接</p>
      
      <form @submit.prevent="handleResetPassword">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="请输入您的邮箱"
          >
        </div>
        
        <button type="submit" class="btn-reset">发送重置链接</button>
        
        <div class="links">
          <router-link to="/login">返回登录</router-link>
          <router-link to="/">返回首页</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')

const handleResetPassword = () => {
  if (!email.value) {
    alert('请输入邮箱')
    return
  }
  
  // 发送重置链接,跳转到登录页面
  alert('重置链接已发送到您的邮箱,请查收')
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-container {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.forgot-password-card {
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

input[type="email"] {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s ease;
}

input[type="email"]:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.btn-reset {
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

.btn-reset:hover {
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

@media (max-width: 768px) {
  .forgot-password-card {
    padding: 20px;
  }
}
</style>
