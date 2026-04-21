<template>
  <div class="container">
    <div class="register-card">
      <div class="logo">🎓</div>
      <h1>注册乡村助学平台</h1>
      
      <form>
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="form.username" placeholder="请输入用户名">
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="form.password" placeholder="请输入密码">
        </div>
        
        <div class="form-group">
          <label for="confirm-password">确认密码</label>
          <input type="password" id="confirm-password" v-model="form.confirmPassword" placeholder="请确认密码">
        </div>
        
        <div class="form-group">
          <label for="name">真实姓名</label>
          <input type="text" id="name" v-model="form.name" placeholder="请输入真实姓名">
        </div>
        
        <div class="form-group">
          <label for="email">邮箱</label>
          <input type="email" id="email" v-model="form.email" placeholder="请输入邮箱">
        </div>
        
        <div class="form-group">
          <label for="phone">电话</label>
          <input type="tel" id="phone" v-model="form.phone" placeholder="请输入电话">
        </div>
        
        <div class="role-selection">
          <label>选择角色</label>
          <div class="role-options">
            <div class="role-option" :class="{ selected: form.role === 'teacher' }" @click="selectRole('teacher')">
              <i>👩‍🏫</i>
              <span>教育教师</span>
            </div>
            <div class="role-option" :class="{ selected: form.role === 'student' }" @click="selectRole('student')">
              <i>👨‍🎓</i>
              <span>儿童/学生</span>
            </div>
            <div class="role-option" :class="{ selected: form.role === 'parent' }" @click="selectRole('parent')">
              <i>👨‍👩‍👧‍👦</i>
              <span>家长/监护人</span>
            </div>
            <div class="role-option" :class="{ selected: form.role === 'admin' }" @click="selectRole('admin')">
              <i>🔧</i>
              <span>管理员</span>
            </div>
          </div>
        </div>
        
        <button type="button" class="btn-register" @click="register">注册</button>
        
        <div class="links">
          <a @click="$router.push('/login')">已有账号？立即登录</a>
          <a @click="$router.push('/')">返回首页</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { post } from '../api/config'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        email: '',
        phone: '',
        role: null
      }
    }
  },
  methods: {
    selectRole(role) {
      this.form.role = role
    },
    async register() {
      if (!this.form.username || !this.form.password || !this.form.confirmPassword || !this.form.name || !this.form.email || !this.form.phone) {
        alert('请填写所有必填字段')
        return
      }
      
      if (this.form.password !== this.form.confirmPassword) {
        alert('两次输入的密码不一致')
        return
      }
      
      if (!this.form.role) {
        alert('请选择角色')
        return
      }
      
      try {
        // 调用后端注册API
        const response = await post('/auth/register', {
          username: this.form.username,
          password: this.form.password,
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          role: this.form.role
        })
        
        if (response.success) {
          alert('注册成功！请登录')
          this.$router.push('/login')
        } else {
          alert(response.message)
        }
      } catch (error) {
        alert('注册失败，请稍后重试')
        console.error('注册失败:', error)
      }
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.container {
  max-width: 500px;
  width: 100%;
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
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

.btn-register:hover {
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
  cursor: pointer;
}

.links a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .container {
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