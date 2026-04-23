const mongoose = require('mongoose');

async function testTeacherChatList() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const Teacher = require('./models/Teacher');
    const TeacherStudentMatch = require('./models/TeacherStudentMatch');
    const Student = require('./models/Student');
    const Message = require('./models/Message');
    const User = require('./models/User');

    // 模拟"我是老师"的请求
    const currentUserId = '69e83057a7ff90923dbc5d14';
    
    console.log('👨‍ 测试老师聊天列表 (UserID:', currentUserId, ')\n');

    // 1. 获取Teacher记录
    const teacher = await Teacher.findOne({ user: currentUserId });
    console.log('✅ Teacher记录ID:', teacher._id);

    // 2. 获取已匹配的学生
    const matches = await TeacherStudentMatch.find({
      teacher: teacher._id,
      status: { $in: ['active', 'approved'] }
    }).populate('student');

    console.log('\n📋 匹配的学生数量:', matches.length);
    matches.forEach((m, i) => {
      console.log(`  ${i + 1}. 学生ID: ${m.student._id}`);
    });

    // 3. 获取学生详细信息
    const studentIds = matches.map(m => m.student._id);
    const studentRecords = await Student.find({ _id: { $in: studentIds } })
      .populate('user')
      .populate('parent');

    console.log('\n‍🎓 学生详情:');
    studentRecords.forEach((s, i) => {
      console.log(`  ${i + 1}. 学生名: ${s.user?.name}`);
      console.log(`     家长: ${s.parent?.name || '无'}`);
      console.log(`     家长ID: ${s.parent?._id || '无'}`);
    });

    // 4. 构建家长映射（去重）
    const parentMap = new Map();
    studentRecords.forEach(student => {
      if (student.parent && student.parent._id) {
        const parentUserId = student.parent._id.toString();
        if (!parentMap.has(parentUserId)) {
          parentMap.set(parentUserId, []);
        }
        parentMap.get(parentUserId).push(student.user.name);
      }
    });

    console.log('\n👨‍👩‍👧 家长映射（去重后）:');
    parentMap.forEach((studentNames, parentUserId) => {
      const remark = studentNames.length > 1 
        ? `${studentNames.join('、')}家长` 
        : `${studentNames[0]}家长`;
      console.log(`  家长ID: ${parentUserId}`);
      console.log(`  备注: ${remark}`);
      console.log(`  学生: ${studentNames.join(', ')}`);
    });

    // 5. 预期聊天列表
    console.log('\n📝 预期聊天列表:');
    let index = 1;
    
    // 学生
    studentRecords.forEach(student => {
      console.log(`  ${index++}. ${student.user.name} (学生)`);
    });
    
    // 家长
    parentMap.forEach((studentNames, parentUserId) => {
      const remark = studentNames.length > 1 
        ? `${studentNames.join('、')}家长` 
        : `${studentNames[0]}家长`;
      console.log(`  ${index++}. ${remark} (家长)`);
    });

    console.log(`\n🎯 总共应该显示 ${studentRecords.length + parentMap.size} 个联系人`);

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

testTeacherChatList();
