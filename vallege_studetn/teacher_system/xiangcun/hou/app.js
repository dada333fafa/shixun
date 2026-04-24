const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

// 加载环境变量
dotenv.config();

// 创建上传目录
const uploadDir = path.join(__dirname, 'uploads', 'resources');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 创建上传目录: uploads/resources');
}

// 连接数据库
connectDB();

// 初始化Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 调试日志 - 记录所有请求
app.use((req, res, next) => {
  console.log(`📥 请求: ${req.method} ${req.path}`);
  next();
});

// 静态文件服务（用于上传的文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由配置 - 整合学生、教师和家长端的路由
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/teachers', require('./routes/teacherRoutes'));
app.use('/api/v1/students', require('./routes/studentRoutes'));
app.use('/api/v1/matches', require('./routes/matchRoutes')); // 已更新为学生端逻辑
app.use('/api/v1/messages', require('./routes/messageRoutes'));
app.use('/api/v1/resources', require('./routes/resourceRoutes'));
app.use('/api/v1/psychological', require('./routes/psychologicalRoutes')); // 已更新为学生端逻辑
app.use('/api/v1/counselors', require('./routes/counselorRoutes'));
app.use('/api/counselors', require('./routes/counselorRoutes'));
app.use('/api/v1/psychological-schedules', require('./routes/psychologicalScheduleRoutes'));
app.use('/api/v1/learning-progress', require('./routes/learningProgressRoutes'));
app.use('/api/v1/teacher-evaluations', require('./routes/teacherEvaluations'));
app.use('/api/v1/admin', require('./routes/adminRoutes')); // 管理员路由

// 学生端特有路由 (兼容 /api 前缀) - 必须在家长端路由之前注册
app.use('/api/ai', require('./routes/aiRoutes')); // 旧版AI路由（兼容）
app.use('/api/v1/ai', require('./routes/aiRoutes')); // 新版AI路由（统一）
app.use('/api/psychological', require('./routes/psychologicalRoutes'));
app.use('/api/matches', require('./routes/matchRoutes')); // 匹配路由（包含家长确认接口）
app.use('/api/resources', require('./routes/teachingResources'));
app.use('/api/users', require('./routes/authRoutes')); // 学生端注册登录

// 家长端消息路由（兼容 /api/messages 前缀）
app.use('/api/messages', require('./routes/messageRoutes'));

// 家长端路由（所有家长接口统一挂载到 /api）- 必须放在最后
app.use('/api', require('./routes/parentRoutes'));

// 健康检查路由
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: '乡村助学平台API运行正常',
    timestamp: new Date().toISOString()
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '请求的资源不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`📡 API地址: http://localhost:${PORT}/api`);
});

module.exports = app;
