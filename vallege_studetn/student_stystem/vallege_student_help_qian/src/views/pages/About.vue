<template>
  <div class="about-container">
    <div class="container">
      <header>
        <h1>关于我们</h1>
        <p class="subtitle">乡村助学平台 - 连接城市教师与乡村孩子的桥梁</p>
        <div class="nav">
          <router-link to="/">首页</router-link>
          <router-link to="/login">登录</router-link>
          <router-link to="/register">注册</router-link>
        </div>
      </header>
      
      <section class="about-section">
        <h2>平台介绍</h2>
        <p>乡村助学平台是一个致力于解决教育公平问题的公益平台，旨在为乡村孩子提供优质的教育资源和心理支持。通过连接城市教师和乡村学生，我们希望能够缩小城乡教育差距，让每个孩子都能拥有平等的学习机会。</p>
        <p>我们的平台提供一对一的教学辅导、心理教育、AI智能匹配等功能，为乡村孩子提供全方位的支持。同时，我们也为城市教师提供了一个参与公益、贡献爱心的渠道，让更多有爱心的教师能够为乡村教育事业做出贡献。</p>
      </section>
      
      <section class="mission-section">
        <h2>我们的使命</h2>
        <div class="mission-cards">
          <div 
            v-for="mission in missions" 
            :key="mission.title"
            class="mission-card"
          >
            <h3>{{ mission.title }}</h3>
            <p>{{ mission.description }}</p>
          </div>
        </div>
      </section>
      
      <section class="contact-section">
        <h2>联系我们</h2>
        <div class="contact-info">
          <div 
            v-for="contact in contacts" 
            :key="contact.title"
            class="contact-item"
          >
            <div class="contact-icon">{{ contact.icon }}</div>
            <div class="contact-text">
              <h3>{{ contact.title }}</h3>
              <p>{{ contact.value }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <footer>
        <p>&copy; 2026 乡村助学平台. 保留所有权利.</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const missions = ref([
  {
    title: '教育公平',
    description: '致力于缩小城乡教育差距,让每个孩子都能接受优质教育,无论他们身在何处。'
  },
  {
    title: '心理支持',
    description: '为留守儿童提供及时的心理干预和支持,帮助他们健康成长,建立积极的心态。'
  },
  {
    title: '智能匹配',
    description: '利用AI技术为学生匹配合适的教师,为教师筛选目标学生,提高教学效率和质量。'
  }
])

const contacts = ref([
  {
    icon: '📧',
    title: '邮箱',
    value: 'contact@rural-education.com'
  },
  {
    icon: '📞',
    title: '电话',
    value: '400-123-4567'
  },
  {
    icon: '📍',
    title: '地址',
    value: '北京市海淀区中关村南大街5号'
  }
])
</script>

<style scoped>
.about-container {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 25px 0;
  text-align: center;
  border-radius: 10px;
  margin-bottom: 40px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  font-size: 2em;
  margin-top: 5px;
  margin-bottom: 20px;
  color: #ffffff;
  font-weight: 600;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.subtitle {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
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

.about-section {
  background: white;
  padding: 40px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.about-section h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.8em;
  font-weight: 600;
  text-align: left;
}

.about-section p {
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 20px;
  text-align: left;
}

.mission-section {
  background: white;
  padding: 40px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.mission-section h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.8em;
  font-weight: 600;
  text-align: left;
}

.mission-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.mission-card {
  background: #f9f9f9;
  padding: 25px;
  border-radius: 10px;
  border-left: 4px solid #4CAF50;
  transition: all 0.3s ease;
}

.mission-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.mission-card h3 {
  color: #4CAF50;
  margin-bottom: 15px;
  font-size: 1.3em;
}

.mission-card p {
  line-height: 1.5;
}

.contact-section {
  background: white;
  padding: 40px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.contact-section h2 {
  color: #4CAF50;
  margin-bottom: 20px;
  font-size: 1.8em;
  font-weight: 600;
  text-align: left;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
  text-align: left;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.contact-text {
  text-align: left;
}

.contact-text h3 {
  margin-bottom: 3px;
  margin-top: 0;
  font-weight: 600;
  font-size: 1.1em;
}

.contact-text p {
  margin: 0;
  font-size: 1em;
}

.contact-icon {
  font-size: 1.5em;
  flex-shrink: 0;
  margin-top: -5px;
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
  
  .about-section,
  .mission-section,
  .contact-section {
    padding: 20px;
  }
  
  .mission-cards {
    grid-template-columns: 1fr;
  }
}
</style>
