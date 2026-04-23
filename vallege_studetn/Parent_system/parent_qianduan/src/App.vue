<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from './components/Layout.vue'

const route = useRoute()

// 判断是否是需要全屏显示的页面（登录、注册等公共页面）
const isPublicPage = computed(() => {
  const publicPaths = ['/', '/login', '/register', '/forgot-password', '/about']
  return publicPaths.includes(route.path)
})

// 获取页面标题
const pageTitle = computed(() => {
  const titleMap = {
    '/parent/dashboard': '仪表盘',
    '/child-management': '孩子管理',
    '/teacher-communication': '教师沟通',
    '/learning-report': '学习报告',
    '/psychological-status': '心理状态',
    '/match-confirmation': '匹配确认'
  }
  return titleMap[route.path] || '家长中心'
})
</script>

<template>
  <!-- 公共页面：不使用侧边栏布局 -->
  <router-view v-if="isPublicPage" />
  
  <!-- 家长中心页面：使用侧边栏布局 -->
  <Layout v-else :title="pageTitle">
    <router-view />
  </Layout>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
