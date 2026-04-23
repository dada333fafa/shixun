const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// 连接数据库
connectDB();

// CORS配置 - 允许前端访问
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'file://'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// 中间件
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: false }));

// 路由
app.use('/api/resources', require('./routes/teachingResources'));
app.use('/api/ai', require('./routes/aiRecommendations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/psychological', require('./routes/psychological'));

// 根路径测试
app.get('/', (req, res) => {
  res.json({ 
    message: '乡村助学平台 API 运行中...',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`前端应该连接到: http://localhost:${PORT}`);
  console.log(`CORS已配置，允许来自 http://localhost:8080 的请求`);
});

// 错误处理
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`端口 ${PORT} 已被占用，请使用其他端口`);
    process.exit(1);
  } else {
    console.log('服务器启动错误:', err);
  }
});

module.exports = server;