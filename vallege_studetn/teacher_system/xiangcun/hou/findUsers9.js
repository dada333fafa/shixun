const mongoose = require('mongoose');
const User = require('./models/User');

async function findUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/xiangcun');
    console.log('✅ 数据库连接成功\n');

    // 查找所有包含数字9的用户
    const users = await User.find({ 
      $or: [
        { name: /9/ },
        { username: /9/ }
      ]
    });
    
    console.log('📊 找到包含9的用户:');
    users.forEach(u => {
      console.log(`  - ID: ${u._id}, 用户名: ${u.username}, 姓名: ${u.name}, 角色: ${u.role}`);
    });

    if (users.length === 0) {
      console.log('❌ 未找到包含9的用户');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

findUsers();
