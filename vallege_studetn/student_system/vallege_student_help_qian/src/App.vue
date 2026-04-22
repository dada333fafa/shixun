<template>
  <router-view />
</template>

<script setup>
// 根组件
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
}

/* 确保所有 router-link 都可点击 */
a, router-link, .router-link-active {
  cursor: pointer;
  text-decoration: none;
}
</style>
