const mongoose = require('mongoose');

async function checkParentStudentRelation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const Student = require('./models/Student');
    const User = require('./models/User');

    // 家长ID
    const parentId = '69e998a8d645f92ec0ed01b6';
    
    // 查找这个家长的学生
    const students = await Student.find({ parent: parentId }).populate('user', 'name');
    
    console.log(`👨‍👩‍👧‍👦 家长 "${parentId}" 关联的学生:\n`);
    
    if (students.length === 0) {
      console.log('❌ 没有学生关联到这个家长！');
    } else {
      students.forEach((s, i) => {
        console.log(`${i + 1}. 学生名: ${s.user?.name || '无'}`);
        console.log(`   学生ID: ${s._id}`);
        console.log(`   家长ID: ${s.parent}`);
        console.log('');
      });
    }

    // 检查老师是否有匹配这些学生
    const Teacher = require('./models/Teacher');
    const TeacherStudentMatch = require('./models/TeacherStudentMatch');
    
    const teacher = await Teacher.findOne({ user: '69e83057a7ff90923dbc5d14' });
    console.log('\n👨‍🏫 老师信息:');
    console.log(`  Teacher ID: ${teacher._id}`);
    console.log(`  User ID: ${teacher.user}`);

    if (students.length > 0) {
      const studentIds = students.map(s => s._id);
      const matches = await TeacherStudentMatch.find({
        teacher: teacher._id,
        student: { $in: studentIds }
      }).populate('student');

      console.log('\n📋 匹配记录:');
      if (matches.length === 0) {
        console.log('❌ 老师没有匹配这些学生！');
      } else {
        matches.forEach((m, i) => {
          console.log(`${i + 1}. 学生: ${m.student?.user?.name || '无'}`);
          console.log(`   状态: ${m.status}`);
          console.log('');
        });
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

checkParentStudentRelation();
