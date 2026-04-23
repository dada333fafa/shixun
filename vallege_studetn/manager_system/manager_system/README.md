# 乡村助学平台 - 管理员系统

这是一个基于 Vue 3 + Express + MongoDB 的乡村助学平台管理员系统。

## 技术栈

### 前端
- Vue 3 (Composition API)
- Vue Router 4
- Axios
- Vite

### 后端
- Node.js
- Express
- MongoDB (Mongoose)
- JWT (JSON Web Token)
- bcryptjs

## 项目结构

```
manager_system/
├── qian_duan/              # 前端目录
│   ├── vue-project/        # Vue项目
│   │   ├── src/
│   │   │   ├── components/ # 组件
│   │   │   ├── views/      # 页面视图
│   │   │   ├── router/     # 路由配置
│   │   │   ├── App.vue     # 根组件
│   │   │   └── main.js     # 入口文件
│   │   ├── index.html
│   │   ├── vite.config.js
│   │   └── package.json
│   └── *.html              # 原始HTML文件(已转换为Vue)
└── hou_duan/               # 后端目录
    ├── models/             # MongoDB数据模型
    ├── routes/             # API路由
    ├── middleware/         # 中间件
    ├── server.js           # 服务器入口
    ├── .env                # 环境变量
    └── package.json
```

## 功能模块

### 1. 用户认证
- 管理员登录
- 管理员注册
- JWT Token认证

### 2. 仪表盘
- 统计数据展示(教师、学生、家长、会话数量)
- 最近用户列表

### 3. 用户管理
- 用户列表(支持分页)
- 搜索和筛选(按用户名、角色、状态)
- 编辑用户信息
- 启用/禁用用户

### 4. 内容管理
- 教学资源管理
- 资源搜索和筛选
- 资源上传、编辑、删除

### 5. AI配置
- 匹配规则配置(权重调整)
- 推荐算法设置
- 模型配置

### 6. 系统设置
- 基本设置(网站名称、URL等)
- 邮件配置
- 安全设置(密码策略、登录限制等)

## 安装和运行

### 前置要求
- Node.js (>= 16.x)
- MongoDB (已创建数据库 rural_education_platform)

### 后端设置

1. 进入后端目录:
```bash
cd hou_duan
```

2. 安装依赖:
```bash
npm install
```

3. 配置环境变量:
编辑 `.env` 文件,确保MongoDB连接字符串正确:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rural_education_platform
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
```

4. 启动后端服务器:
```bash
npm run dev
```

5. (可选)初始化测试数据:
```bash
npm run seed
```
这将创建测试账号和示例数据,方便快速体验系统功能。

后端将在 http://localhost:5000 运行

### 前端设置

1. 进入前端目录:
```bash
cd qian_duan/vue-project
```

2. 安装依赖:
```bash
npm install
```

3. 启动开发服务器:
```bash
npm run dev
```

前端将在 http://localhost:3000 运行

## 使用流程

1. **首次使用**: 访问 http://localhost:3000/register 注册管理员账号

2. **登录**: 使用注册的账号登录系统

3. **管理功能**: 
   - 在仪表盘中查看统计数据
   - 在用户管理中管理所有用户
   - 在内容管理中管理教学资源
   - 在AI配置中调整推荐算法参数
   - 在系统设置中配置系统参数

## API接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户管理
- `GET /api/users` - 获取用户列表(支持分页和筛选)
- `PUT /api/users/:id/status` - 更新用户状态

### 资源管理
- `GET /api/resources` - 获取教学资源列表

### AI配置
- `GET /api/ai-config` - 获取AI配置
- `PUT /api/ai-config` - 更新AI配置

### 系统设置
- `GET /api/settings` - 获取系统设置
- `PUT /api/settings` - 更新系统设置

## 数据库说明

本项目使用MongoDB数据库,数据库名为 `rural_education_platform`。

主要集合(Collections):
- `users` - 用户信息
- `teachers` - 教师详细信息
- `students` - 学生详细信息
- `teachingresources` - 教学资源
- `aiconfigs` - AI配置
- `systemsettings` - 系统设置

## 注意事项

1. 确保MongoDB服务正在运行
2. 首次使用前需要注册管理员账号
3. JWT密钥应在生产环境中更改为强随机字符串
4. 建议在生产环境中启用HTTPS
5. 定期备份数据库

## 开发说明

- 前端使用Vite作为构建工具,支持热更新
- 后端使用nodemon实现自动重启
- 所有API请求都需要携带JWT Token(除登录注册外)
- 管理员相关接口需要admin角色权限

## 常见问题

**Q: 无法连接到MongoDB?**
A: 检查MongoDB服务是否启动,以及.env中的连接字符串是否正确

**Q: 登录后跳转到其他页面又回到登录页?**
A: 检查localStorage中是否有token,可能是token过期或无效

**Q: API请求失败?**
A: 检查后端服务器是否运行,以及vite.config.js中的代理配置是否正确

## 许可证

MIT License
