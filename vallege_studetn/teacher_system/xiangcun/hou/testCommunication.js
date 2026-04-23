const mongoose = require('mongoose');
require('dotenv').config();

async function testCommunication() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功\n');

    const User = require('./models/User');
    const Student = require('./models/Student');
    const Teacher = require('./models/Teacher');
    const Parent = require('./models/Parent');
    const TeacherStudentMatch = require('./models/TeacherStudentMatch');
    const Message = require('./models/Message');

    // 1. 检查用户数据
    console.log('👥 检查用户数据：');
    const users = await User.find({});
    console.log(`总用户数: ${users.length}`);
    
    const parents = await User.find({ role: 'parent' });
    console.log(`家长用户: ${parents.length}`);
    parents.forEach(p => console.log(`  - ${p.name} (${p._id})`));
    
    const students = await User.find({ role: 'student' });
    console.log(`\n学生用户: ${students.length}`);
    students.forEach(s => console.log(`  - ${s.name} (${s._id})`));
    
    const teachers = await User.find({ role: 'teacher' });
    console.log(`\n教师用户: ${teachers.length}`);
    teachers.forEach(t => console.log(`  - ${t.name} (${t._id})`));

    // 2. 检查学生-家长关系
    console.log('\n\n👨‍👩‍👧‍👦 检查学生-家长关系：');
    const studentRecords = await Student.find({}).populate('user', 'name').populate('parent', 'name');
    studentRecords.forEach(s => {
      console.log(`学生: ${s.user.name}, 家长: ${s.parent ? s.parent.name : '无'}`);
    });

    // 3. 检查师生匹配
    console.log('\n\n🤝 检查师生匹配：');
    const matches = await TeacherStudentMatch.find({})
      .populate('student')
      .populate('teacher')
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });
    
    console.log(`匹配记录数: ${matches.length}`);
    matches.forEach(m => {
      const studentName = m.student?.user?.name || '未知';
      const teacherName = m.teacher?.user?.name || '未知';
      console.log(`  ${studentName} <-> ${teacherName} (状态: ${m.status})`);
    });

    // 4. 检查消息数据
    console.log('\n\n💬 检查消息数据：');
    const messages = await Message.find({})
      .populate('senderId', 'name')
      .populate('receiverId', 'name');
    
    console.log(`消息总数: ${messages.length}`);
    messages.slice(0, 10).forEach(m => {
      const senderName = m.senderId?.name || '未知';
      const receiverName = m.receiverId?.name || '未知';
      console.log(`  ${senderName} -> ${receiverName}: ${m.content.substring(0, 30)}...`);
    });

    // 5. 测试按孩子获取教师
    if (studentRecords.length > 0) {
      console.log('\n\n🎯 测试：按孩子获取教师');
      const testStudent = studentRecords[0];
      console.log(`测试学生: ${testStudent.user.name}`);
      
      const studentMatches = await TeacherStudentMatch.find({
        student_id: testStudent._id,
        status: { $in: ['active', 'approved'] }
      }).populate({ path: 'teacher', populate: { path: 'user', select: 'name' } });
      
      console.log(`该学生的教师数: ${studentMatches.length}`);
      studentMatches.forEach(m => {
        console.log(`  - ${m.teacher?.user?.name || '未知'}`);
      });
    }

    // 6. 测试家长-教师沟通场景
    if (parents.length > 0 && teachers.length > 0) {
      console.log('\n\n📱 测试：家长-教师沟通场景');
      const testParent = parents[0];
      const testTeacher = teachers[0];
      
      console.log(`家长: ${testParent.name} (${testParent._id})`);
      console.log(`教师: ${testTeacher.name} (${testTeacher._id})`);
      
      // 查找他们之间的消息
      const conversation = await Message.find({
        $or: [
          { senderId: testParent._id, receiverId: testTeacher._id },
          { senderId: testTeacher._id, receiverId: testParent._id }
        ]
      })
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .sort({ createdAt: 1 });
      
      console.log(`对话消息数: ${conversation.length}`);
      conversation.slice(0, 5).forEach(m => {
        const senderName = m.senderId?.name || '未知';
        const time = new Date(m.createdAt).toLocaleString('zh-CN');
        console.log(`  [${time}] ${senderName}: ${m.content.substring(0, 50)}...`);
      });
    }

    console.log('\n\n✅ 测试完成！');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ 测试失败:', error);
    mongoose.disconnect();
  }
}

testCommunication();
