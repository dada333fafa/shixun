<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 判断是否是教师端需要全屏的页面
const isFullWidth = computed(() => {
  const fullPathPaths = [
    '/teacher/dashboard',
    '/teacher/students',
    '/teacher/ai-match',
    '/teacher/match-management'
  ]
  return fullPathPaths.includes(route.path)
})
</script>

<template>
  <div id="app" :class="{ 'full-width': isFullWidth }">
    <router-view />
  </div>
</template>

<style>
/* 教师端需要撑满全屏的页面 */
#app.full-width {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  text-align: left !important;
}
</style>
