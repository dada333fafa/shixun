const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 连接数据库
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_education_platform';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB 连接成功');
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    process.exit(1);
  }
};

// 创建默认管理员
const createDefaultAdmin = async () => {
  try {
    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  管理员账户已存在');
      return;
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 创建默认管理员
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: '系统管理员',
      email: 'admin@example.com',
      phone: '12345678900'
    });

    console.log('✅ 默认管理员创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('请在首次登录后立即修改密码！');
  } catch (error) {
    console.error('❌ 创建管理员失败:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

// 执行
connectDB().then(createDefaultAdmin);
