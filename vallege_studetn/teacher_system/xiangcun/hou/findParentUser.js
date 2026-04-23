// 查询家长用户信息
const mongoose = require('mongoose');
require('dotenv').config();

async function findParentUser() {
  try {
    // 使用正确的数据库
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功: rural_education_platform');
    
    const User = require('./models/User');
    const Parent = require('./models/Parent');
    
    // 查找所有家长
    const parents = await Parent.find().populate('user');
    console.log('\n📋 家长列表:');
    parents.forEach(parent => {
      console.log(`  家长ID: ${parent._id}`);
      console.log(`  用户ID: ${parent.user._id}`);
      console.log(`  用户名: ${parent.user.username}`);
      console.log(`  姓名: ${parent.user.name}`);
      console.log(`  邮箱: ${parent.user.email}`);
      console.log('  ---');
    });
    
    // 查找所有用户
    console.log('\n📋 所有用户:');
    const users = await User.find({ role: 'parent' });
    users.forEach(user => {
      console.log(`  ID: ${user._id}`);
      console.log(`  用户名: ${user.username}`);
      console.log(`  姓名: ${user.name}`);
      console.log(`  邮箱: ${user.email}`);
      console.log('  ---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

findParentUser();
