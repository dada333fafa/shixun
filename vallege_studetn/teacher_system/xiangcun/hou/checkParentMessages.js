const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const Student = require('./models/Student');
    const User = require('./models/User');
    const Message = require('./models/Message');
    const Teacher = require('./models/Teacher');
    const TeacherStudentMatch = require('./models/TeacherStudentMatch');

    // 1. 查看所有学生及其parent字段
    console.log('📋 所有学生:');
    const students = await Student.find().populate('user').populate('parent');
    students.forEach(s => {
      console.log(`- 学生: ${s.user?.name || '未知'}`);
      console.log(`  Student ID: ${s._id}`);
      console.log(`  User ID: ${s.user?._id}`);
      console.log(`  Parent字段: ${s.parent}`);
      console.log(`  Parent详细信息:`, s.parent ? {
        _id: s.parent._id,
        name: s.parent.name,
        username: s.parent.username
      } : '无');
      console.log('');
    });

    // 2. 查看老师的匹配记录
    console.log('\n👨‍🏫 老师匹配记录:');
    const teachers = await Teacher.find().populate('user');
    for (const teacher of teachers) {
      console.log(`\n老师: ${teacher.user?.name} (Teacher ID: ${teacher._id}, User ID: ${teacher.user?._id})`);
      
      const matches = await TeacherStudentMatch.find({ 
        teacher: teacher._id,
        status: { $in: ['active', 'approved'] }
      }).populate('student');
      
      console.log(`  已匹配学生数量: ${matches.length}`);
      matches.forEach(m => {
        const studentName = m.student?.user?.name || '未知';
        console.log(`  - ${studentName} (Student ID: ${m.student?._id})`);
      });
    }

    // 3. 查看消息记录
    console.log('\n💬 最近的消息记录:');
    const messages = await Message.find().sort({ createdAt: -1 }).limit(10);
    messages.forEach(m => {
      console.log(`- From: ${m.senderId} -> To: ${m.receiverId}`);
      console.log(`  Content: ${m.content.substring(0, 50)}...`);
      console.log(`  Time: ${m.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

checkData();
