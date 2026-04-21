<template>
  <div class="container">
    <div class="login-card">
      <div class="logo">🎓</div>
      <h1>登录乡村助学平台</h1>
      
      <form>
        <div class="form-group">
          <label for="username">用户名</label>
          <input type="text" id="username" v-model="username" placeholder="请输入用户名">
        </div>
        
        <div class="form-group">
          <label for="password">密码</label>
          <input type="password" id="password" v-model="password" placeholder="请输入密码">
        </div>
        
        <div class="role-selection">
          <label>选择角色</label>
          <div class="role-options">
            <div class="role-option" :class="{ selected: selectedRole === 'teacher' }" @click="selectRole('teacher')">
              <i>👩‍🏫</i>
              <span>教育教师</span>
            </div>
            <div class="role-option" :class="{ selected: selectedRole === 'student' }" @click="selectRole('student')">
              <i>👨‍🎓</i>
              <span>儿童/学生</span>
            </div>
            <div class="role-option" :class="{ selected: selectedRole === 'parent' }" @click="selectRole('parent')">
              <i>👨‍👩‍👧‍👦</i>
              <span>家长/监护人</span>
            </div>
            <div class="role-option" :class="{ selected: selectedRole === 'admin' }" @click="selectRole('admin')">
              <i>🔧</i>
              <span>管理员</span>
            </div>
          </div>
        </div>
        
        <button type="button" class="btn-login" @click="login">登录</button>
        
        <div class="links">
          <a @click="$router.push('/register')">注册新账号</a>
          <a @click="$router.push('/forgot-password')">忘记密码</a>
          <a @click="$router.push('/')">返回首页</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { post } from '../api/config'

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      selectedRole: null
    }
  },
  methods: {
    selectRole(role) {
      this.selectedRole = role
    },
    async login() {
      if (!this.username || !this.password) {
        alert('请输入用户名和密码')
        return
      }
      
      if (!this.selectedRole) {
        alert('请选择角色')
        return
      }
      
      try {
        // 调用后端登录API
        const response = await post('/auth/login', {
          username: this.username,
          password: this.password
        })
        
        if (response.success) {
          // 登录成功，检查角色是否匹配
          if (response.user.role === this.selectedRole) {
            // 清除旧的用户信息，然后存储新的用户信息
            localStorage.removeItem('user')
            localStorage.setItem('user', JSON.stringify(response.user))
            
            // 根据角色跳转到相应的界面
            switch(this.selectedRole) {
              case 'teacher':
                this.$router.push('/teacher-dashboard').then(() => {
                  // 强制刷新页面，确保所有组件都能获取到最新的用户信息
                  window.location.reload()
                })
                break
              case 'student':
                this.$router.push('/student-dashboard').then(() => {
                  window.location.reload()
                })
                break
              case 'parent':
                this.$router.push('/parent-dashboard').then(() => {
                  window.location.reload()
                })
                break
              case 'admin':
                this.$router.push('/admin-dashboard').then(() => {
                  window.location.reload()
                })
                break
            }
          } else {
            alert('角色选择错误')
          }
        } else {
          alert(response.message)
        }
      } catch (error) {
        alert('登录失败，请稍后重试')
        console.error('登录失败:', error)
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

.login-card {
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
  cursor: pointer;
}

.links a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  
  .login-card {
    padding: 20px;
  }
  
  .role-options {
    grid-template-columns: 1fr;
  }
}
</style>