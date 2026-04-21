# 乡村助学平台后端 API

基于 Express + MongoDB 的乡村助学平台后端服务。

## 技术栈

- **Node.js** - JavaScript 运行时
- **Express** - Web 框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB ODM
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Multer** - 文件上传

## 项目结构

```
hou/
├── config/           # 配置文件
│   └── db.js        # MongoDB 连接配置
├── controllers/      # 控制器层
│   ├── authController.js         # 认证控制器
│   ├── teacherController.js      # 教师控制器
│   ├── studentController.js      # 学生控制器
│   ├── matchController.js        # 匹配控制器
│   ├── messageController.js      # 消息控制器
│   ├── resourceController.js     # 资源控制器
│   ├── psychologicalController.js # 心理状态控制器
│   ├── learningProgressController.js # 学习进度控制器
│   └── aiController.js           # AI推荐控制器
├── middleware/       # 中间件
│   └── auth.js      # JWT 认证中间件
├── models/          # 数据模型
│   ├── User.js      # 用户模型
│   ├── Teacher.js   # 教师模型
│   ├── Student.js   # 学生模型
│   ├── Match.js     # 匹配模型
│   ├── Message.js   # 消息模型
│   ├── Resource.js  # 资源模型
│   ├── Psychological.js # 心理状态模型
│   ├── LearningProgress.js # 学习进度模型
│   └── AIRecommendation.js # AI推荐模型
├── routes/          # 路由层
│   ├── authRoutes.js
│   ├── teacherRoutes.js
│   ├── studentRoutes.js
│   ├── matchRoutes.js
│   ├── messageRoutes.js
│   ├── resourceRoutes.js
│   ├── psychologicalRoutes.js
│   ├── learningProgressRoutes.js
│   └── aiRoutes.js
├── uploads/         # 上传文件目录
├── .env            # 环境变量配置
├── .gitignore      # Git 忽略配置
├── app.js          # 应用入口
└── package.json    # 项目依赖
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env` 文件并修改配置：

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rural_education_platform
JWT_SECRET=rural_education_secret_key_2026
JWT_EXPIRE=7d
```

### 3. 启动 MongoDB

确保本地 MongoDB 服务已启动，或使用 MongoDB Atlas 云数据库。

### 4. 运行项目

开发模式（支持热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动。

## API 接口文档

### 基础 URL

```
http://localhost:3000/api
```

### 认证接口（Auth）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/auth/register` | 用户注册 | ❌ |
| POST | `/auth/login` | 用户登录 | ❌ |
| POST | `/auth/forgot-password` | 忘记密码 | ❌ |
| GET | `/auth/me` | 获取当前用户信息 | ✅ |
| PUT | `/auth/me` | 更新用户信息 | ✅ |

### 教师接口（Teachers）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/teachers` | 获取教师列表 | ✅ 教师 |
| GET | `/teachers/:id` | 获取教师详情 | ✅ 教师 |
| GET | `/teachers/dashboard` | 获取仪表盘数据 | ✅ 教师 |

### 学生接口（Students）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/students` | 获取学生列表 | ✅ 教师 |
| GET | `/students/:id` | 获取学生详情 | ✅ 教师 |

### 匹配接口（Matches）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/matches` | 创建匹配请求 | ✅ 教师 |
| GET | `/matches` | 获取匹配列表 | ✅ 教师 |
| GET | `/matches/:id` | 获取匹配详情 | ✅ 教师 |
| PUT | `/matches/:id` | 更新匹配状态 | ✅ 教师 |
| DELETE | `/matches/:id` | 删除匹配 | ✅ 教师 |

### 消息接口（Messages）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/messages` | 发送消息 | ✅ 教师 |
| GET | `/messages` | 获取消息列表 | ✅ 教师 |
| PUT | `/messages/:id/read` | 标记消息已读 | ✅ 教师 |

### 资源接口（Resources）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/resources` | 上传资源 | ✅ 教师 |
| GET | `/resources` | 获取资源列表 | ✅ 教师 |
| GET | `/resources/:id` | 获取资源详情 | ✅ 教师 |
| DELETE | `/resources/:id` | 删除资源 | ✅ 教师 |

### 心理状态接口（Psychological）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/psychological` | 创建心理记录 | ✅ 教师 |
| GET | `/psychological` | 获取心理记录列表 | ✅ 教师 |
| GET | `/psychological/:id` | 获取心理记录详情 | ✅ 教师 |

### 学习进度接口（Learning Progress）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | `/learning-progress` | 创建学习进度 | ✅ 教师 |
| GET | `/learning-progress` | 获取学习进度列表 | ✅ 教师 |
| GET | `/learning-progress/:id` | 获取学习进度详情 | ✅ 教师 |
| PUT | `/learning-progress/:id` | 更新学习进度 | ✅ 教师 |

### AI推荐接口（AI）

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | `/ai` | 获取推荐列表 | ✅ 教师 |
| POST | `/ai/generate` | 生成推荐 | ✅ 教师 |

## 响应格式

### 成功响应

```json
{
  "status": "success",
  "message": "操作成功",
  "data": { ... }
}
```

### 错误响应

```json
{
  "status": "error",
  "message": "错误描述"
}
```

## 认证方式

在请求头中添加 JWT Token：

```
Authorization: Bearer <your_jwt_token>
```

## 角色权限

- **teacher**: 教师 - 可以访问所有教师端功能
- **student**: 学生 - （暂未实现）
- **parent**: 家长 - （暂未实现）
- **admin**: 管理员 - （暂未实现）

## 注意事项

1. 确保 MongoDB 服务已启动
2. 首次运行前请检查 `.env` 配置
3. 上传文件保存在 `uploads/resources/` 目录
4. JWT Token 有效期默认为 7 天
5. 密码使用 bcryptjs 加密存储

## 开发规范

- 遵循 RESTful API 设计规范
- 统一响应格式
- 使用 JWT 进行身份认证
- 敏感操作需要角色授权
- 错误处理统一通过中间件
