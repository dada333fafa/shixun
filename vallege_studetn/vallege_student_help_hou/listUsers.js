const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

// 连接数据库
connectDB();

async function listUsers() {
  try {
    console.log('\n========== 用户列表 ==========');
    
    const users = await User.find().select('username name email role').sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('数据库中没有用户');
    } else {
      console.log(`找到 ${users.length} 个用户:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. 用户名: ${user.username}`);
        console.log(`   姓名: ${user.name}`);
        console.log(`   邮箱: ${user.email || '未设置'}`);
        console.log(`   角色: ${user.role}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
}

listUsers();
