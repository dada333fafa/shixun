# 快速启动指南

## 第一步: 安装后端依赖

打开终端,运行以下命令:

```bash
cd hou_duan
npm install
```

## 第二步: 安装前端依赖

打开另一个终端,运行以下命令:

```bash
cd qian_duan/vue-project
npm install
```

## 第三步: 确保MongoDB正在运行

确认MongoDB服务已启动,并且数据库 `rural_education_platform` 已创建。

## 第四步: 启动后端服务器

在后端目录(hou_duan)中运行:

```bash
npm run dev
```

你应该看到:
- "MongoDB连接成功"
- "服务器运行在端口 5000"

## 第五步: 启动前端开发服务器

在前端目录(qian_duan/vue-project)中运行:

```bash
npm run dev
```

你应该看到:
- Vite开发服务器启动信息
- 本地访问地址: http://localhost:3000

## 第六步: 访问应用

1. 打开浏览器访问: http://localhost:3000
2. 首次使用请点击"立即注册"创建管理员账号
3. 注册成功后使用账号登录

## 默认测试账号(如果需要)

如果你想手动创建测试数据,可以使用以下信息:

**管理员账号:**
- 用户名: admin
- 密码: admin123
- 角色: admin

注意: 这些账号需要通过API或MongoDB命令行手动插入,或者通过注册页面创建新账号。

## 常见问题排查

### 问题1: 端口被占用

如果3000或5000端口被占用,可以修改:
- 前端: `qian_duan/vue-project/vite.config.js` 中的 `port`
- 后端: `hou_duan/.env` 中的 `PORT`

### 问题2: MongoDB连接失败

检查:
1. MongoDB服务是否启动
2. `.env` 文件中的 `MONGODB_URI` 是否正确
3. 数据库 `rural_education_platform` 是否存在

### 问题3: 前端无法连接到后端

检查:
1. 后端服务器是否正常运行
2. `vite.config.js` 中的代理配置是否正确
3. 浏览器控制台是否有CORS错误

### 问题4: 登录后又跳回登录页

检查:
1. 浏览器localStorage中是否有token
2. JWT_SECRET在前后端是否一致
3. Token是否过期

## 开发建议

1. **保持两个终端窗口打开**: 一个运行后端,一个运行前端
2. **查看日志**: 遇到问题时查看两个终端的输出日志
3. **浏览器开发者工具**: 使用Network标签查看API请求
4. **MongoDB Compass**: 推荐使用MongoDB Compass可视化管理数据库

## 下一步

项目启动成功后,你可以:
1. 注册并登录管理员账号
2. 探索各个管理功能模块
3. 根据需求修改和扩展功能
4. 添加更多用户数据进行测试

祝你使用愉快! 🎉
