// 查询教师用户信息
const mongoose = require('mongoose');

async function findTeacherUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功');
    
    const User = require('./models/User');
    const Teacher = require('./models/Teacher');
    
    // 查找所有教师
    const teachers = await Teacher.find().populate('user');
    console.log('\n📋 教师列表:');
    teachers.forEach(teacher => {
      console.log(`  教师ID: ${teacher._id}`);
      console.log(`  用户ID: ${teacher.user._id}`);
      console.log(`  用户名: ${teacher.user.username}`);
      console.log(`  姓名: ${teacher.user.name}`);
      console.log(`  邮箱: ${teacher.user.email}`);
      console.log('  ---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

findTeacherUser();
