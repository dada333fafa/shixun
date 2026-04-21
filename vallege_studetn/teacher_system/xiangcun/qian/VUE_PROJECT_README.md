# 乡村助学平台 - Vue版本

## 项目结构

```
src/
├── views/                    # 视图组件
│   ├── auth/                # 认证相关页面
│   │   ├── Login.vue        # 登录页面
│   │   ├── Register.vue     # 注册页面
│   │   └── ForgotPassword.vue  # 忘记密码页面
│   ├── teacher/             # 教师相关页面
│   │   ├── Dashboard.vue           # 教师仪表盘
│   │   ├── StudentManagement.vue   # 学生管理
│   │   ├── Chat.vue                # 聊天沟通
│   │   ├── Resources.vue           # 教学资源
│   │   ├── Psychological.vue       # 心理辅导
│   │   ├── AIMatch.vue             # AI匹配
│   │   └── MatchManagement.vue     # 匹配管理
│   └── pages/               # 通用页面
│       ├── Home.vue         # 首页
│       └── About.vue        # 关于我们
├── router/                  # 路由配置
│   └── index.js            # 路由定义
├── App.vue                 # 根组件
└── main.js                 # 入口文件
```

## 功能模块

### 1. 认证模块 (auth)
- 登录 (Login.vue)
- 注册 (Register.vue)
- 忘记密码 (ForgotPassword.vue)

### 2. 教师模块 (teacher)
- 教师仪表盘 (Dashboard.vue)
- 学生管理 (StudentManagement.vue)
- 聊天沟通 (Chat.vue)
- 教学资源 (Resources.vue)
- 心理辅导 (Psychological.vue)
- AI智能匹配 (AIMatch.vue)
- 匹配管理 (MatchManagement.vue)

### 3. 通用页面 (pages)
- 首页 (Home.vue)
- 关于我们 (About.vue)

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Vite
- 原生CSS (Scoped Styles)

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 路由说明

- `/` - 首页
- `/about` - 关于我们
- `/login` - 登录
- `/register` - 注册
- `/forgot-password` - 忘记密码
- `/teacher/dashboard` - 教师仪表盘
- `/teacher/students` - 学生管理
- `/teacher/chat` - 聊天沟通
- `/teacher/resources` - 教学资源
- `/teacher/psychological` - 心理辅导
- `/teacher/ai-match` - AI匹配
- `/teacher/match-management` - 匹配管理

## 注意事项

1. 所有HTML文件已转换为Vue单文件组件(.vue)
2. 使用了Vue Router进行路由管理
3. 样式使用scoped避免全局污染
4. 保留了原有的所有功能和交互逻辑
5. 使用了Composition API (script setup语法)

## 后续优化建议

1. 添加状态管理(Pinia/Vuex)
2. 集成API调用(Axios)
3. 添加表单验证
4. 实现用户认证守卫
5. 添加加载状态和错误处理
6. 优化移动端响应式
7. 添加单元测试
