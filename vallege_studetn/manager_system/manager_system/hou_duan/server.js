const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const resourceRoutes = require('./routes/resources');
const aiConfigRoutes = require('./routes/aiConfig');
const settingsRoutes = require('./routes/settings');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/ai-config', aiConfigRoutes);
app.use('/api/settings', settingsRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
