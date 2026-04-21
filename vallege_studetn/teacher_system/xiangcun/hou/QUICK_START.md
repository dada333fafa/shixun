# 快速开始指南

## 🚀 5分钟快速启动

### 前置要求

1. **Node.js** (v16+)
2. **MongoDB** (本地或Atlas)

### 步骤1: 安装依赖

```bash
cd d:\vue\xiangcun\hou
npm install
```

### 步骤2: 配置环境变量

编辑 `.env` 文件（已创建好，可直接使用）：

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/rural_education_platform
JWT_SECRET=rural_education_secret_key_2026
JWT_EXPIRE=7d
```

> 如果使用 MongoDB Atlas，修改 `MONGODB_URI` 为你的连接字符串

### 步骤3: 启动 MongoDB

**Windows:**
```bash
# 如果已安装MongoDB服务
net start MongoDB

# 或者手动启动
mongod
```

**Mac/Linux:**
```bash
brew services start mongodb-community
# 或
sudo systemctl start mongod
```

### 步骤4: 启动后端服务

```bash
# 开发模式（推荐，支持热重载）
npm run dev

# 或生产模式
npm start
```

看到以下输出表示成功：
```
🚀 服务器运行在端口 3000
📡 API地址: http://localhost:3000/api
MongoDB Connected: localhost
```

### 步骤5: 测试API

打开新终端，测试健康检查：

```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:3000/api/health -UseBasicParsing

# 或使用浏览器访问
http://localhost:3000/api/health
```

预期响应：
```json
{
  "status": "success",
  "message": "乡村助学平台API运行正常",
  "timestamp": "..."
}
```

## 📝 快速测试流程

### 1. 注册教师账号

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "username": "teacher001",
    "password": "123456",
    "role": "teacher",
    "name": "张老师",
    "phone": "13800138000",
    "email": "teacher@example.com"
  }'
```

### 2. 登录获取Token

```powershell
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "username": "teacher001",
    "password": "123456",
    "role": "teacher"
  }'

$TOKEN = $response.data.token
Write-Host "Token: $TOKEN"
```

### 3. 访问教师端接口

```powershell
# 获取教师列表
Invoke-RestMethod -Uri "http://localhost:3000/api/teachers" `
  -Headers @{ Authorization = "Bearer $TOKEN" }

# 获取仪表盘
Invoke-RestMethod -Uri "http://localhost:3000/api/teachers/dashboard" `
  -Headers @{ Authorization = "Bearer $TOKEN" }
```

## 🔧 常见问题

### Q1: MongoDB连接失败

**错误信息**: `MongoNetworkError: connect ECONNREFUSED`

**解决方案**:
```bash
# 检查MongoDB是否运行
# Windows
Get-Service MongoDB

# 启动MongoDB
net start MongoDB
```

### Q2: 端口被占用

**错误信息**: `Error: listen EADDRINUSE: address already in use :::3000`

**解决方案**:
```bash
# 方法1: 关闭占用端口的进程
netstat -ano | findstr :3000
taskkill /PID <进程ID> /F

# 方法2: 修改.env中的PORT
PORT=3001
```

### Q3: 依赖安装失败

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules和package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 重新安装
npm install
```

### Q4: Token过期

**错误信息**: `401 Unauthorized - Token expired`

**解决方案**: 重新登录获取新token

## 📚 相关文档

- [README.md](./README.md) - 完整项目说明
- [API_TEST.md](./API_TEST.md) - API测试指南
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目开发总结

## 🎯 下一步

1. ✅ 后端已完成
2. ⏭️ 可以开始对接前端Vue项目
3. ⏭️ 测试所有API接口
4. ⏭️ 部署到生产环境

## 💡 提示

- 开发时使用 `npm run dev` 支持代码修改自动重启
- 查看完整API文档请访问: [README.md](./README.md#api-接口文档)
- 所有教师端接口都需要在Header中携带Token
- Token格式: `Authorization: Bearer <your_token>`

---

**服务器地址**: http://localhost:3000  
**API基础路径**: http://localhost:3000/api
