# 项目结构说明

```
manager_system/
│
├── qian_duan/                          # 前端目录
│   ├── vue-project/                    # Vue 3 项目
│   │   ├── node_modules/               # 依赖包
│   │   ├── public/                     # 静态资源
│   │   ├── src/                        # 源代码
│   │   │   ├── components/             # 可复用组件
│   │   │   │   └── Sidebar.vue         # 侧边栏导航组件
│   │   │   │
│   │   │   ├── views/                  # 页面视图
│   │   │   │   ├── Login.vue           # 登录页面 ⭐新建
│   │   │   │   ├── Register.vue        # 注册页面 ⭐新建
│   │   │   │   ├── AdminDashboard.vue  # 管理员仪表盘 (从HTML转换)
│   │   │   │   ├── UserManagement.vue  # 用户管理 (从HTML转换)
│   │   │   │   ├── ContentManagement.vue # 内容管理 (从HTML转换)
│   │   │   │   ├── AIConfiguration.vue # AI配置 (从HTML转换)
│   │   │   │   └── SystemSettings.vue  # 系统设置 (从HTML转换)
│   │   │   │
│   │   │   ├── router/                 # 路由配置
│   │   │   │   └── index.js            # Vue Router配置
│   │   │   │
│   │   │   ├── App.vue                 # 根组件
│   │   │   └── main.js                 # 应用入口
│   │   │
│   │   ├── index.html                  # HTML模板
│   │   ├── vite.config.js              # Vite配置(含API代理)
│   │   └── package.json                # 前端依赖
│   │
│   ├── admin-dashboard.html            # 原始HTML文件(已转换)
│   ├── admin-user-management.html      # 原始HTML文件(已转换)
│   ├── admin-content-management.html   # 原始HTML文件(已转换)
│   ├── admin-ai-configuration.html     # 原始HTML文件(已转换)
│   └── admin-system-settings.html      # 原始HTML文件(已转换)
│
├── hou_duan/                           # 后端目录
│   ├── node_modules/                   # 依赖包
│   │
│   ├── models/                         # MongoDB数据模型
│   │   ├── User.js                     # 用户模型(含密码加密)
│   │   ├── Teacher.js                  # 教师信息模型
│   │   ├── Student.js                  # 学生信息模型
│   │   ├── TeachingResource.js         # 教学资源模型
│   │   ├── AIConfig.js                 # AI配置模型
│   │   └── SystemSettings.js           # 系统设置模型
│   │
│   ├── routes/                         # API路由
│   │   ├── auth.js                     # 认证路由(登录/注册)
│   │   ├── users.js                    # 用户管理路由
│   │   ├── resources.js                # 资源管理路由
│   │   ├── aiConfig.js                 # AI配置路由
│   │   └── settings.js                 # 系统设置路由
│   │
│   ├── middleware/                     # 中间件
│   │   └── auth.js                     # JWT认证和权限控制
│   │
│   ├── server.js                       # Express服务器入口
│   ├── seed.js                         # 数据初始化脚本 ⭐
│   ├── .env                            # 环境变量配置
│   └── package.json                    # 后端依赖
│
├── README.md                           # 项目说明文档
├── QUICKSTART.md                       # 快速启动指南
├── PROJECT_SUMMARY.md                  # 项目完成总结
├── API.md                              # API接口文档
└── .gitignore                          # Git忽略文件配置
```

## 关键文件说明

### 前端核心文件

#### 1. `src/router/index.js`
- 配置所有路由路径
- 实现路由守卫(需要登录才能访问)
- 懒加载组件优化性能

#### 2. `src/components/Sidebar.vue`
- 共享的侧边栏导航
- 自动高亮当前路由
- 处理退出登录逻辑

#### 3. `src/views/Login.vue` ⭐新建
- 美观的登录界面
- 表单验证
- 调用后端登录API
- 存储JWT Token到localStorage

#### 4. `src/views/Register.vue` ⭐新建
- 美观的注册界面
- 密码确认验证
- 调用后端注册API
- 注册成功后跳转登录页

#### 5. `vite.config.js`
- 配置开发服务器端口(3000)
- 配置API代理(转发到后端5000端口)
- 解决跨域问题

### 后端核心文件

#### 1. `server.js`
- Express应用配置
- MongoDB连接
- 路由注册
- CORS配置
- 错误处理

#### 2. `models/User.js`
- 用户数据结构定义
- 密码自动加密(pre-save钩子)
- 密码验证方法(comparePassword)
- 角色枚举约束

#### 3. `middleware/auth.js`
- `protect`: JWT Token验证中间件
- `adminOnly`: 管理员权限检查
- 保护需要认证的接口

#### 4. `routes/auth.js`
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- 生成和验证JWT Token

#### 5. `routes/users.js`
- GET `/api/users` - 获取用户列表(支持分页、搜索、筛选)
- PUT `/api/users/:id/status` - 更新用户状态
- 需要管理员权限

#### 6. `seed.js` ⭐实用工具
- 一键创建测试数据
- 包含所有角色的测试账号
- 创建示例教学资源
- 方便快速体验系统

### 配置文件

#### 1. `.env`
```env
PORT=5000                                    # 后端端口
MONGODB_URI=mongodb://localhost:27017/...   # MongoDB连接字符串
JWT_SECRET=your-secret-key                   # JWT密钥(生产环境需更改)
JWT_EXPIRE=7d                                # Token有效期
```

#### 2. `package.json`
- 前端: Vue, Vue Router, Axios, Vite
- 后端: Express, Mongoose, bcryptjs, jsonwebtoken, cors

## 数据流向

### 登录流程
```
用户输入 → Login.vue 
    → axios.post('/api/auth/login') 
    → Vite代理转发 
    → routes/auth.js 
    → User模型验证 
    → 返回JWT Token 
    → 存储到localStorage 
    → 跳转到/dashboard
```

### 获取用户列表流程
```
UserManagement.vue 
    → axios.get('/api/users', {headers: {Authorization: Bearer token}}) 
    → middleware/auth.js验证Token 
    → routes/users.js处理请求 
    → User模型查询数据库 
    → 返回分页数据 
    → 渲染到表格
```

## 样式说明

所有Vue组件都保留了原始HTML的样式:
- 紫色渐变主题: `#9C27B0` → `#7B1FA2`
- 响应式设计: 适配移动端
- 卡片布局: 阴影和悬停效果
- 统一的按钮样式和交互反馈

## 技术特点

### 前端
- ✅ Vue 3 Composition API (`<script setup>`)
- ✅ Vue Router 路由守卫
- ✅ Axios HTTP客户端
- ✅ 组件化开发
- ✅ 响应式数据绑定

### 后端
- ✅ RESTful API设计
- ✅ JWT身份认证
- ✅ bcrypt密码加密
- ✅ Mongoose ODM
- ✅ 中间件架构
- ✅ 错误处理

### 数据库
- ✅ MongoDB文档数据库
- ✅ Schema数据验证
- ✅ 关联查询(populate)
- ✅ 自动时间戳(timestamps)

## 扩展建议

如需添加新功能,可以参考以下模式:

1. **新增页面**:
   - 在`src/views/`创建新Vue组件
   - 在`src/router/index.js`添加路由
   - 在Sidebar.vue添加导航链接

2. **新增API**:
   - 在`models/`创建数据模型
   - 在`routes/`创建路由文件
   - 在`server.js`注册路由
   - 在middleware中添加权限控制(如需要)

3. **前端调用API**:
   - 使用axios发送请求
   - 在请求头携带Token
   - 处理响应和错误

---

**提示**: 查看各个文件中的注释,了解更详细的实现逻辑。
