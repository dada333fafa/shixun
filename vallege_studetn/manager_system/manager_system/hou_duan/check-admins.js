require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_education');
    console.log('MongoDB连接成功');
    
    const admins = await User.find({ role: 'admin' }).select('username name email role createdAt');
    
    console.log('\n=== 管理员账号列表 ===\n');
    if (admins.length === 0) {
      console.log('当前没有管理员账号');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. 用户名: ${admin.username}`);
        console.log(`   姓名: ${admin.name || '未设置'}`);
        console.log(`   邮箱: ${admin.email || '未设置'}`);
        console.log(`   角色: ${admin.role}`);
        console.log(`   创建时间: ${admin.createdAt}`);
        console.log('');
      });
      console.log(`总计: ${admins.length} 个管理员账号`);
    }
    
    process.exit();
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
})();
