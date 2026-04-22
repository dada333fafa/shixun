# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## 认证说明

除登录注册接口外,所有接口都需要在请求头中携带JWT Token:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. 认证接口 (Auth)

### 1.1 用户注册

**接口**: `POST /api/auth/register`

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123",
  "role": "admin",
  "name": "管理员",
  "email": "admin@example.com",
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "_id": "用户ID",
    "username": "admin",
    "name": "管理员",
    "role": "admin",
    "token": "jwt_token_here"
  }
}
```

### 1.2 用户登录

**接口**: `POST /api/auth/login`

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "用户ID",
    "username": "admin",
    "name": "管理员",
    "role": "admin",
    "email": "admin@example.com",
    "phone": "13800138000"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

---

## 2. 用户管理接口 (Users)

需要管理员权限

### 2.1 获取用户列表

**接口**: `GET /api/users`

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `search`: 搜索关键词(用户名或姓名)
- `role`: 角色筛选 (teacher/student/parent/admin)
- `status`: 状态筛选 (active/inactive)

**示例**: `GET /api/users?page=1&limit=10&role=teacher&status=active`

**响应**:
```json
{
  "success": true,
  "users": [
    {
      "_id": "用户ID",
      "id": "用户ID",
      "username": "teacher1",
      "name": "王老师",
      "role": "teacher",
      "email": "teacher1@example.com",
      "phone": "13900139001",
      "isActive": true,
      "createdAt": "2026-04-22T10:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "totalPages": 5
}
```

### 2.2 更新用户状态

**接口**: `PUT /api/users/:id/status`

**请求体**:
```json
{
  "isActive": false
}
```

**响应**:
```json
{
  "success": true,
  "message": "用户状态更新成功",
  "user": {
    "_id": "用户ID",
    "username": "teacher1",
    "name": "王老师",
    "isActive": false
  }
}
```

---

## 3. 资源管理接口 (Resources)

需要管理员权限

### 3.1 获取教学资源列表

**接口**: `GET /api/resources`

**查询参数**:
- `page`: 页码 (默认: 1)
- `search`: 搜索标题
- `type`: 资源类型 (courseware/lesson_plan/exercise/video/other)

**示例**: `GET /api/resources?page=1&type=courseware`

**响应**:
```json
{
  "success": true,
  "resources": [
    {
      "_id": "资源ID",
      "id": "资源ID",
      "title": "三年级数学上册课件",
      "description": "包含第一单元知识点",
      "resourceType": "courseware",
      "teacherName": "王老师",
      "uploadDate": "2026-04-22T10:00:00.000Z",
      "downloadCount": 25
    }
  ],
  "total": 10,
  "page": 1,
  "totalPages": 1
}
```

---

## 4. AI配置接口 (AI Config)

需要管理员权限

### 4.1 获取AI配置

**接口**: `GET /api/ai-config`

**响应**:
```json
{
  "success": true,
  "config": {
    "_id": "配置ID",
    "subjectWeight": 80,
    "gradeWeight": 70,
    "experienceWeight": 60,
    "ratingWeight": 50,
    "maxRecommendations": 5,
    "minMatchScore": 60,
    "algorithmType": "hybrid",
    "algorithmParams": {
      "similarity_threshold": 0.7,
      "top_k": 10,
      "alpha": 0.6,
      "beta": 0.4
    },
    "modelName": "ai-recommender-v1.0",
    "modelEndpoint": "http://localhost:8000/api/v1/recommend",
    "timeout": 30
  }
}
```

### 4.2 更新AI配置

**接口**: `PUT /api/ai-config`

**请求体**:
```json
{
  "subjectWeight": 85,
  "gradeWeight": 75,
  "experienceWeight": 65,
  "ratingWeight": 55,
  "maxRecommendations": 5,
  "minMatchScore": 60
}
```

**响应**:
```json
{
  "success": true,
  "message": "AI配置保存成功",
  "config": {
    // 更新后的配置对象
  }
}
```

---

## 5. 系统设置接口 (Settings)

需要管理员权限

### 5.1 获取系统设置

**接口**: `GET /api/settings`

**响应**:
```json
{
  "success": true,
  "settings": {
    "_id": "设置ID",
    "siteName": "乡村助学平台",
    "siteDescription": "为乡村孩子提供优质教育资源和心理支持",
    "siteUrl": "http://localhost:3000",
    "timezone": "Asia/Shanghai",
    "language": "zh-CN",
    "adminEmail": "admin@example.com",
    "sessionTimeout": 30,
    "passwordLength": 8,
    "loginAttempts": 5,
    "lockoutDuration": 30,
    "twoFactorEnabled": false,
    "httpsEnabled": false
  }
}
```

### 5.2 更新系统设置

**接口**: `PUT /api/settings`

**请求体**:
```json
{
  "siteName": "乡村助学平台",
  "siteDescription": "为乡村孩子提供优质教育资源和心理支持",
  "sessionTimeout": 45,
  "passwordLength": 10,
  "twoFactorEnabled": true
}
```

**响应**:
```json
{
  "success": true,
  "message": "系统设置保存成功",
  "settings": {
    // 更新后的设置对象
  }
}
```

---

## 6. 健康检查

**接口**: `GET /api/health`

**响应**:
```json
{
  "status": "ok",
  "message": "服务器运行正常"
}
```

---

## 错误响应格式

所有错误响应都遵循以下格式:

```json
{
  "success": false,
  "message": "错误描述信息",
  "error": "详细错误信息(仅开发环境)"
}
```

### 常见HTTP状态码

- `200` - 请求成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权(Token无效或缺失)
- `403` - 禁止访问(权限不足)
- `404` - 资源不存在
- `500` - 服务器内部错误

---

## 使用示例

### JavaScript (Fetch API)

```javascript
// 登录
const login = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  return data.token;
};

// 获取用户列表
const getUsers = async (token) => {
  const response = await fetch('http://localhost:5000/api/users?page=1&limit=10', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

### cURL

```bash
# 登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 获取用户列表
curl http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 注意事项

1. **Token有效期**: 默认为7天,可在`.env`中修改`JWT_EXPIRE`
2. **分页限制**: 建议每页不超过100条记录
3. **速率限制**: 生产环境建议添加请求频率限制
4. **数据安全**: 敏感操作建议添加二次验证
5. **CORS**: 开发环境已启用CORS,生产环境需配置允许的域名

---

## 测试账号

运行 `npm run seed` 后可以使用以下测试账号:

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 教师 | teacher1 | teacher123 |
| 教师 | teacher2 | teacher123 |
| 家长 | parent1 | parent123 |
| 家长 | parent2 | parent123 |
| 学生 | student1 | student123 |
| 学生 | student2 | student123 |

---

**API版本**: v1.0  
**最后更新**: 2026-04-22
