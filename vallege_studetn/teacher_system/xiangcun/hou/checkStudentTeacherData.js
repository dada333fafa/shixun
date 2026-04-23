const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const Student = require('./models/Student');
    const Teacher = require('./models/Teacher');
    const TeacherStudentMatch = require('./models/TeacherStudentMatch');
    const User = require('./models/User');

    // 1. 查找两个孩子
    console.log('📋 查找所有学生:');
    const students = await Student.find().populate('user');
    console.log(`找到 ${students.length} 个学生:\n`);
    students.forEach(s => {
      console.log(`- ${s.user?.name || '未知'} (ID: ${s._id}, User ID: ${s.user?._id})`);
      console.log(`  年级: ${s.grade}, 学校: ${s.school}`);
      console.log(`  Parent: ${s.parent || '无'}\n`);
    });

    // 2. 查找所有教师
    console.log('\n👨‍🏫 查找所有教师:');
    const teachers = await Teacher.find().populate('user');
    console.log(`找到 ${teachers.length} 个教师:\n`);
    teachers.forEach(t => {
      console.log(`- ${t.user?.name || '未知'} (ID: ${t._id}, User ID: ${t.user?._id})`);
      console.log(`  专业: ${t.subject}\n`);
    });

    // 3. 查找所有师生匹配记录
    console.log('\n🔗 查找所有师生匹配记录:');
    const matches = await TeacherStudentMatch.find()
      .populate('student')
      .populate('teacher');
    console.log(`找到 ${matches.length} 条匹配记录:\n`);
    matches.forEach(m => {
      const studentName = m.student?.user?.name || m.student?.name || '未知';
      const teacherName = m.teacher?.user?.name || m.teacher?.name || '未知';
      console.log(`- 学生: ${studentName} (ID: ${m.student?._id})`);
      console.log(`  教师: ${teacherName} (ID: ${m.teacher?._id})`);
      console.log(`  状态: ${m.status}`);
      console.log(`  Parent Approval: ${m.parentApproval}\n`);
    });

    // 4. 检查特定学生的匹配
    if (students.length > 0) {
      console.log('\n 检查第一个学生的匹配:');
      const firstStudent = students[0];
      console.log(`学生: ${firstStudent.user?.name}, ID: ${firstStudent._id}\n`);
      
      const studentMatches = await TeacherStudentMatch.find({ 
        student: firstStudent._id,
        status: { $in: ['active', 'approved'] }
      }).populate('teacher');
      
      console.log(`找到 ${studentMatches.length} 条活跃匹配:\n`);
      studentMatches.forEach(m => {
        const teacherName = m.teacher?.user?.name || '未知';
        console.log(`- 教师: ${teacherName} (ID: ${m.teacher?._id})`);
        console.log(`  状态: ${m.status}\n`);
      });

      // 测试查询
      console.log('🔍 测试 distinct 查询:');
      const teacherIds = await TeacherStudentMatch.find({
        student: firstStudent._id,
        status: { $in: ['active', 'approved'] }
      }).distinct('teacher');
      console.log(`教师IDs:`, teacherIds);
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

checkData();
