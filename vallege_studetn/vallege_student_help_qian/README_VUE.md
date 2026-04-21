# 乡村助学平台 - Vue前端

## 📦 项目说明

这是乡村助学平台的Vue 3前端项目，使用Vite作为构建工具。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

项目将在 http://localhost:8080 启动

### 3. 构建生产版本

```bash
npm run build
```

### 4. 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
vallege_student_help_qian/
├── src/
│   ├── views/          # 页面组件
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   └── student/    # 学生端页面
│   │       ├── Dashboard.vue
│   │       ├── TeacherSelection.vue
│   │       ├── Chat.vue
│   │       ├── Resources.vue
│   │       ├── Psychological.vue
│   │       ├── AIRecommendation.vue
│   │       └── Match.vue
│   ├── router/         # 路由配置
│   │   └── index.js
│   ├── utils/          # 工具函数
│   │   └── api.js      # API接口
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── index.html          # HTML模板
├── vite.config.js      # Vite配置
└── package.json        # 项目配置
```

## 🔧 技术栈

- **Vue 3** - 渐进式JavaScript框架
- **Vue Router** - 官方路由管理器
- **Vite** - 下一代前端构建工具
- **原生CSS** - 样式设计

## 🌐 API代理配置

Vite已配置API代理，所有 `/api` 请求会自动转发到后端服务器 `http://localhost:5001`

配置位置：`vite.config.js`

```javascript
server: {
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://localhost:5001',
      changeOrigin: true
    }
  }
}
```

## 📝 注意事项

1. **后端服务必须先启动**：确保后端服务在 http://localhost:5001 运行
2. **不要修改后端文件夹**：所有修改仅限于 `vallege_student_help_qian` 文件夹
3. **保持功能一致**：Vue版本的功能与原版HTML完全相同

## 🎯 页面路由

- `/login` - 登录页面
- `/register` - 注册页面
- `/student/dashboard` - 学生仪表盘
- `/student/teacher-selection` - 教师选择
- `/student/chat` - 聊天沟通
- `/student/resources` - 学习资源
- `/student/psychological` - 心理支持
- `/student/ai-recommendation` - AI推荐
- `/student/match` - 匹配管理

## 🔐 认证

使用JWT Token进行身份验证，Token存储在localStorage中。

## 📊 与原HTML版本的对比

| 特性 | HTML版本 | Vue版本 |
|------|---------|---------|
| 页面类型 | 多页面应用(MPA) | 单页面应用(SPA) |
| 路由 | 超链接跳转 | Vue Router |
| 状态管理 | 全局变量 | Vue响应式 |
| 组件化 | 无 | 有 |
| 构建工具 | 无 | Vite |
| 开发体验 | 一般 | 热更新、快速 |

## 💡 开发建议

1. 使用VS Code + Volar插件获得最佳开发体验
2. 利用Vue DevTools进行调试
3. 遵循Vue 3 Composition API最佳实践
4. 保持组件单一职责原则
