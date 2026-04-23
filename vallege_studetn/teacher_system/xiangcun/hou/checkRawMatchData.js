const mongoose = require('mongoose');

async function checkRawData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const TeacherStudentMatch = require('./models/TeacherStudentMatch');

    // 获取原始匹配记录
    console.log('📋 查看原始匹配记录:');
    const matches = await TeacherStudentMatch.find({
      status: { $in: ['active', 'approved'] }
    }).lean();
    
    console.log(`找到 ${matches.length} 条活跃/已批准的匹配:\n`);
    
    matches.forEach((m, index) => {
      console.log(`匹配 ${index + 1}:`);
      console.log(`  _id: ${m._id}`);
      console.log(`  teacher: ${m.teacher}`);
      console.log(`  student: ${m.student}`);
      console.log(`  status: ${m.status}`);
      console.log(`  parentApproval: ${m.parentApproval}`);
      console.log(`\n`);
    });

    // 重点查看"刘子华"的匹配
    console.log('\n 查看学生 69e97d0ffd05ae867312ecd4 (刘子华) 的匹配:');
    const liuMatches = await TeacherStudentMatch.find({
      student: new mongoose.Types.ObjectId('69e97d0ffd05ae867312ecd4'),
      status: { $in: ['active', 'approved'] }
    }).lean();
    
    console.log(`找到 ${liuMatches.length} 条匹配:\n`);
    liuMatches.forEach(m => {
      console.log(`  Teacher ID: ${m.teacher}`);
    });

    // 查看这个教师的信息
    if (liuMatches.length > 0) {
      const Teacher = require('./models/Teacher');
      const teacher = await Teacher.findById(liuMatches[0].teacher).lean();
      console.log('\n 教师信息:');
      console.log(`  _id: ${teacher._id}`);
      console.log(`  user: ${teacher.user}`);
      console.log(`  subject: ${teacher.subject}`);

      const User = require('./models/User');
      const user = await User.findById(teacher.user).lean();
      console.log('\n 关联的User:');
      console.log(`  _id: ${user._id}`);
      console.log(`  name: ${user.name}`);
      console.log(`  role: ${user.role}`);
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

checkRawData();
