const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const TeacherStudentMatch = require('./models/TeacherStudentMatch');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xiangcun_zhuxue')
.then(async () => {
  console.log('✅ 数据库连接成功\n');

  // 查找所有教师
  const teachers = await Teacher.find().populate('user', 'name');
  console.log('📚 教师列表:');
  teachers.forEach(t => {
    console.log(`  - ${t.user.name} (ID: ${t._id})`);
  });

  // 查找所有学生
  const students = await Student.find().populate('user', 'name');
  console.log('\n👨‍🎓 学生列表:');
  students.forEach(s => {
    if (s.user) {
      console.log(`  - ${s.user.name} (ID: ${s._id})`);
    } else {
      console.log(`  - 未知学生 (ID: ${s._id}) - ⚠️ 未关联用户`);
    }
  });

  // 查找所有匹配关系
  const matches = await TeacherStudentMatch.find()
    .populate('teacher', 'user')
    .populate('student', 'user')
    .populate('teacher.user', 'name')
    .populate('student.user', 'name');

  console.log('\n🔗 师生匹配关系:');
  if (matches.length === 0) {
    console.log('  ⚠️  没有任何匹配关系！');
    console.log('\n💡 请先在匹配管理页面建立师生辅导关系');
  } else {
    matches.forEach(m => {
      const teacherName = m.teacher?.user?.name || '未知';
      const studentName = m.student?.user?.name || '未知';
      console.log(`  - ${teacherName} → ${studentName} (状态: ${m.status})`);
    });
  }

  console.log('\n💡 调试建议:');
  console.log('1. 检查教师ID是否正确');
  console.log('2. 检查学生ID是否正确');
  console.log('3. 确认师生之间是否有 active 或 approved 状态的匹配关系');
  console.log('4. TeacherStudentMatch表中的 teacher 和 student 字段需要是ObjectId类型');

  process.exit(0);
})
.catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
