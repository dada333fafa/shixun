# 乡村助学平台后端 API 测试指南

## 健康检查

```bash
curl http://localhost:3000/api/health
```

预期响应：
```json
{
  "status": "success",
  "message": "乡村助学平台API运行正常",
  "timestamp": "2026-04-20T08:35:36.635Z"
}
```

## 用户注册测试

### 注册教师账号

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher001",
    "password": "123456",
    "role": "teacher",
    "name": "张老师",
    "phone": "13800138000",
    "email": "teacher@example.com"
  }'
```

### 注册学生账号

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student001",
    "password": "123456",
    "role": "student",
    "name": "李同学",
    "phone": "13900139000",
    "email": "student@example.com"
  }'
```

## 用户登录测试

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher001",
    "password": "123456",
    "role": "teacher"
  }'
```

预期响应（包含token）：
```json
{
  "status": "success",
  "message": "登录成功",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 使用Token访问受保护接口

将上面获取的token保存，然后在后续请求中使用：

```bash
# 设置环境变量（Windows PowerShell）
$TOKEN = "your_jwt_token_here"

# 获取当前用户信息
curl http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer $TOKEN"

# 获取教师列表
curl http://localhost:3000/api/teachers `
  -H "Authorization: Bearer $TOKEN"

# 获取教师仪表盘数据
curl http://localhost:3000/api/teachers/dashboard `
  -H "Authorization: Bearer $TOKEN"
```

## 完整测试流程

### 1. 注册并登录教师

```powershell
# 注册
$registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"test_teacher","password":"123456","role":"teacher","name":"测试教师","phone":"13800138000","email":"test@teacher.com"}'

# 登录
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"test_teacher","password":"123456","role":"teacher"}'

$TOKEN = $loginResponse.data.token
Write-Host "Token: $TOKEN"
```

### 2. 测试教师端功能

```powershell
# 获取教师列表
Invoke-RestMethod -Uri "http://localhost:3000/api/teachers" `
  -Headers @{ Authorization = "Bearer $TOKEN" }

# 获取仪表盘
Invoke-RestMethod -Uri "http://localhost:3000/api/teachers/dashboard" `
  -Headers @{ Authorization = "Bearer $TOKEN" }
```

## Postman 测试

也可以使用 Postman 进行测试：

1. **注册接口**
   - Method: POST
   - URL: http://localhost:3000/api/auth/register
   - Body (JSON):
     ```json
     {
       "username": "teacher001",
       "password": "123456",
       "role": "teacher",
       "name": "张老师",
       "phone": "13800138000",
       "email": "teacher@example.com"
     }
     ```

2. **登录接口**
   - Method: POST
   - URL: http://localhost:3000/api/auth/login
   - Body (JSON):
     ```json
     {
       "username": "teacher001",
       "password": "123456",
       "role": "teacher"
     }
     ```
   - 保存返回的 token

3. **受保护接口**
   - 在 Headers 中添加：
     ```
     Authorization: Bearer <your_token>
     ```

## 注意事项

1. 确保 MongoDB 服务已启动
2. 首次使用前需要先注册用户
3. Token 有效期为 7 天
4. 所有教师端接口都需要教师角色的 token
5. 文件上传接口需要 multipart/form-data 格式

## 常见问题

### Q: 连接数据库失败
A: 检查 MongoDB 是否启动，确认 .env 中的 MONGODB_URI 配置正确

### Q: 401 Unauthorized
A: 检查 token 是否正确，格式是否为 "Bearer <token>"

### Q: 403 Forbidden
A: 检查用户角色是否有权限访问该接口

### Q: 端口被占用
A: 修改 .env 中的 PORT 配置，或关闭占用端口的程序
