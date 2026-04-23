const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('✅ 数据库连接成功\n');
  
  const User = require('./models/User');
  const Teacher = require('./models/Teacher');
  const Student = require('./models/Student');
  
  // 获取所有教师用户
  const teacherUsers = await User.find({ role: 'teacher' });
  console.log(`找到 ${teacherUsers.length} 个教师用户`);
  
  // 为每个教师用户创建Teacher记录
  let teacherCount = 0;
  for (const user of teacherUsers) {
    const existingTeacher = await Teacher.findOne({ user: user._id });
    if (!existingTeacher) {
      await Teacher.create({
        user: user._id,
        subject: '未设置',
        education: '',
        experience: '',
        introduction: '',
        rating: 0
      });
      console.log(`  ✅ 为教师 ${user.name} (${user.username}) 创建了Teacher记录`);
      teacherCount++;
    } else {
      console.log(`  ⏭️  教师 ${user.name} 的Teacher记录已存在`);
    }
  }
  
  console.log(`\n共创建 ${teacherCount} 个新的Teacher记录\n`);
  
  // 获取所有学生用户
  const studentUsers = await User.find({ role: 'student' });
  console.log(`找到 ${studentUsers.length} 个学生用户`);
  
  // 为每个学生用户创建Student记录
  let studentCount = 0;
  for (const user of studentUsers) {
    const existingStudent = await Student.findOne({ user: user._id });
    if (!existingStudent) {
      await Student.create({
        user: user._id,
        grade: '未设置',
        school: '',
        address: ''
      });
      console.log(`  ✅ 为学生 ${user.name} (${user.username}) 创建了Student记录`);
      studentCount++;
    } else {
      console.log(`  ⏭️  学生 ${user.name} 的Student记录已存在`);
    }
  }
  
  console.log(`\n共创建 ${studentCount} 个新的Student记录\n`);
  
  // 统计结果
  const totalTeachers = await Teacher.countDocuments();
  const totalStudents = await Student.countDocuments();
  
  console.log('========== 恢复完成 ==========');
  console.log(`📊 Teachers总数: ${totalTeachers}`);
  console.log(`📊 Students总数: ${totalStudents}`);
  console.log('================================\n');
  
  process.exit();
}).catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
