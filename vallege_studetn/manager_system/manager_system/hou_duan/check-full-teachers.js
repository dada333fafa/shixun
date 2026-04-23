require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rural_education');
    console.log('MongoDB连接成功\n');
    
    // 查询所有教师用户
    const teacherUsers = await User.find({ role: 'teacher' });
    
    console.log('=== 教师完整数据列表 ===\n');
    console.log(`总计: ${teacherUsers.length} 位教师\n`);
    
    for (let i = 0; i < teacherUsers.length; i++) {
      const user = teacherUsers[i];
      
      // 查询对应的教师详细信息
      const teacherDetail = await Teacher.findOne({ userId: user._id });
      
      console.log(`${i + 1}. 【用户基本信息】`);
      console.log(`   用户名: ${user.username}`);
      console.log(`   姓名: ${user.name}`);
      console.log(`   角色: ${user.role}`);
      console.log(`   邮箱: ${user.email || '未设置'}`);
      console.log(`   电话: ${user.phone || '未设置'}`);
      console.log(`   激活状态: ${user.isActive ? '是' : '否'}`);
      console.log(`   创建时间: ${user.createdAt}`);
      console.log('');
      
      if (teacherDetail) {
        console.log(`   【教师详细信息】`);
        console.log(`   科目: ${teacherDetail.subject}`);
        console.log(`   学历: ${teacherDetail.education || '未设置'}`);
        console.log(`   教学经验: ${teacherDetail.experience || '未设置'}`);
        console.log(`   个人简介: ${teacherDetail.introduction || '未设置'}`);
        console.log(`   评分: ${teacherDetail.rating || '未设置'}`);
        console.log(`   记录创建时间: ${teacherDetail.createdAt}`);
      } else {
        console.log(`   ⚠️  警告: 未找到该教师的详细信息记录`);
      }
      console.log('');
      console.log('   ' + '='.repeat(60));
      console.log('');
    }
    
    process.exit();
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
})();
