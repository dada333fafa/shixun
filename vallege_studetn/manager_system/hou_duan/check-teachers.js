require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_education');
    console.log('MongoDB连接成功\n');
    
    const teachers = await User.find({ role: 'teacher' }).select('username name subject grade education experience rating email phone gender age createdAt');
    
    console.log('=== 教师数据列表 ===\n');
    console.log(`总计: ${teachers.length} 位教师\n`);
    
    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. 用户名: ${teacher.username}`);
      console.log(`   姓名: ${teacher.name}`);
      console.log(`   科目: ${teacher.subject || '未设置'}`);
      console.log(`   年级: ${teacher.grade || '未设置'}`);
      console.log(`   学历: ${teacher.education || '未设置'}`);
      console.log(`   教学经验: ${teacher.experience || '未设置'}`);
      console.log(`   评分: ${teacher.rating || '未设置'}`);
      console.log(`   邮箱: ${teacher.email || '未设置'}`);
      console.log(`   电话: ${teacher.phone || '未设置'}`);
      console.log(`   性别: ${teacher.gender || '未设置'}`);
      console.log(`   年龄: ${teacher.age || '未设置'}`);
      console.log(`   创建时间: ${teacher.createdAt}`);
      console.log('');
    });
    
    process.exit();
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
})();
