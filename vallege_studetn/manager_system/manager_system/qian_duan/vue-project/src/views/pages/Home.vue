<template>
  <div class="home-container">
    <header>
      <h1>乡村助学平台</h1>
      <p class="subtitle">连接城市教师与乡村孩子的桥梁</p>
      <div class="nav">
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
        <router-link to="/about">关于我们</router-link>
      </div>
    </header>
    
    <section class="hero">
      <h2>让每个孩子都能接受优质教育</h2>
      <p>乡村助学平台致力于解决教育公平问题,为乡村孩子提供优质的教育资源和心理支持。通过连接城市教师和乡村学生,我们希望能够缩小城乡教育差距,让每个孩子都能拥有平等的学习机会。</p>
    </section>
    
    <section class="features">
      <div class="feature-card" v-for="feature in features" :key="feature.title">
        <div class="feature-icon">{{ feature.icon }}</div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </section>
    
    <section class="roles">
      <h2>系统角色</h2>
      <div class="role-cards">
        <div class="role-card" v-for="role in roles" :key="role.title">
          <h3>{{ role.title }}</h3>
          <p>{{ role.description }}</p>
        </div>
      </div>
    </section>
    
    <footer>
      <p>&copy; 2026 乡村助学平台. 保留所有权利.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const features = ref([
  {
    icon: '📚',
    title: '教学辅导',
    description: '城市教师为乡村学生提供一对一的教学辅导,帮助他们解决学习问题,提高学习成绩。'
  },
  {
    icon: '❤️',
    title: '心理教育',
    description: '为留守儿童提供及时的心理干预和支持,帮助他们健康成长,建立积极的心态。'
  },
  {
    icon: '🤖',
    title: 'AI智能匹配',
    description: '利用AI技术为学生匹配合适的教师,为教师筛选目标学生,提高教学效率和质量。'
  }
])

const roles = ref([
  {
    title: '教育教师',
    description: '提供教学辅导和心理教育'
  },
  {
    title: '儿童/学生',
    description: '接受教育辅导和心理支持'
  },
  {
    title: '家长/监护人',
    description: '了解孩子的学习情况和心理状态'
  },
  {
    title: '管理员',
    description: '管理系统用户和内容'
  }
])
</script>

<style scoped>
.home-container {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 30px 0;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  font-size: 2.2em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  color: white;
  font-weight: bold;
}

.subtitle {
  font-size: 1.2em;
  margin-bottom: 25px;
  margin-top: 5px;
  color: white;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 25px;
}

.nav a {
  background-color: white;
  color: #4CAF50;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-decoration: none;
}

.nav a:hover {
  background-color: #e8f5e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.hero {
  background: white;
  padding: 40px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  text-align: center;
}

.hero h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.7em;
  font-weight: 550;
}

.hero p {
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 30px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.feature-card {
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  text-align: left;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.feature-card h3 {
  color: #4CAF50;
  margin-bottom: 15px;
  font-size: 1.5em;
}

.feature-card p {
  line-height: 1.5;
}

.feature-icon {
  font-size: 3em;
  margin-bottom: 15px;
  color: #4CAF50;
}

.roles {
  background: white;
  padding: 40px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.roles h2 {
  color: #4CAF50;
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.7em;
  font-weight: 600;
}

.role-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.role-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  border: 2px solid #4CAF50;
  transition: all 0.3s ease;
}

.role-card:hover {
  background: #e8f5e8;
  transform: translateY(-3px);
}

.role-card h3 {
  color: #4CAF50;
  margin-bottom: 10px;
}

footer {
  background: #333;
  color: white;
  text-align: center;
  padding: 30px 0;
  border-radius: 10px;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    align-items: center;
  }
  
  .nav a {
    width: 200px;
  }
  
  .hero {
    padding: 20px;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}
</style>
