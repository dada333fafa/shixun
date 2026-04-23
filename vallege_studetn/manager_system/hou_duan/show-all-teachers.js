require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const teacherUsers = await User.find({ role: 'teacher' }).sort({ createdAt: 1 });
    
    console.log('\n' + '='.repeat(80));
    console.log('                    完整教师数据列表（共20位）');
    console.log('='.repeat(80) + '\n');
    
    let subjectCount = {};
    
    for (let i = 0; i < teacherUsers.length; i++) {
      const user = teacherUsers[i];
      const teacherDetail = await Teacher.findOne({ userId: user._id });
      
      // 统计科目数量
      if (teacherDetail) {
        subjectCount[teacherDetail.subject] = (subjectCount[teacherDetail.subject] || 0) + 1;
      }
      
      console.log(`${i + 1}. 【${user.name}】`);
      console.log(`   用户名: ${user.username}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   电话: ${user.phone}`);
      
      if (teacherDetail) {
        console.log(`   科目: ${teacherDetail.subject}`);
        console.log(`   学历: ${teacherDetail.education}`);
        console.log(`   评分: ${teacherDetail.rating}`);
        console.log(`   经验: ${teacherDetail.experience.substring(0, 60)}...`);
        console.log(`   简介: ${teacherDetail.introduction.substring(0, 60)}...`);
      }
      
      console.log('');
    }
    
    console.log('='.repeat(80));
    console.log('                         科目分布统计');
    console.log('='.repeat(80));
    Object.keys(subjectCount).forEach(subject => {
      console.log(`   ${subject}: ${subjectCount[subject]} 位`);
    });
    console.log(`\n   总计: ${teacherUsers.length} 位教师`);
    console.log('='.repeat(80) + '\n');
    
    process.exit();
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
})();
