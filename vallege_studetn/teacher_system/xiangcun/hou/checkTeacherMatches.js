const mongoose = require('mongoose');

async function checkTeacherMatches() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const Teacher = require('./models/Teacher');
    const TeacherStudentMatch = require('./models/TeacherStudentMatch');
    const Student = require('./models/Student');
    const User = require('./models/User');

    // 老师UserID
    const teacherUserId = '69e83057a7ff90923dbc5d14';
    
    // 获取Teacher记录
    const teacher = await Teacher.findOne({ user: teacherUserId });
    console.log('👨‍ 老师信息:');
    console.log(`  Teacher ID: ${teacher._id}`);
    console.log(`  User ID: ${teacher.user}\n`);

    // 获取所有匹配记录
    const allMatches = await TeacherStudentMatch.find({ teacher: teacher._id })
      .populate('student');

    console.log(`📊 所有匹配记录 (${allMatches.length}条):\n`);
    allMatches.forEach((m, i) => {
      console.log(`${i + 1}. Match ID: ${m._id}`);
      console.log(`   学生: ${m.student?.user?.name || '未知'}`);
      console.log(`   状态: ${m.status}`);
      console.log('');
    });

    // 只显示approved/active的
    const activeMatches = await TeacherStudentMatch.find({ 
      teacher: teacher._id,
      status: { $in: ['active', 'approved'] }
    }).populate('student');

    console.log(`✅ 已辅导的学生 (${activeMatches.length}个):\n`);
    activeMatches.forEach((m, i) => {
      console.log(`${i + 1}. ${m.student?.user?.name || '未知'}`);
    });

    // 检查"Jintang Wen"这个学生
    const jintangUser = await User.findOne({ name: /Jintang|jintang/i });
    if (jintangUser) {
      console.log('\n🔍 关于 "Jintang Wen":');
      console.log(`  User ID: ${jintangUser._id}`);
      console.log(`  Name: ${jintangUser.name}`);
      console.log(`  Role: ${jintangUser.role}`);

      const jintangStudent = await Student.findOne({ user: jintangUser._id });
      if (jintangStudent) {
        console.log(`  Student ID: ${jintangStudent._id}`);
        console.log(`  Parent: ${jintangStudent.parent || '无'}`);

        // 检查是否有匹配记录
        const jintangMatch = await TeacherStudentMatch.findOne({
          teacher: teacher._id,
          student: jintangStudent._id
        });

        if (jintangMatch) {
          console.log(`  ⚠️  有匹配记录！状态: ${jintangMatch.status}`);
        } else {
          console.log(`  ✅ 没有匹配记录`);
        }
      }
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

checkTeacherMatches();
