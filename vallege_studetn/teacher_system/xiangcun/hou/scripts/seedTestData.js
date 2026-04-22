const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== 添加真实测试数据 ===\n');
  
  try {
    // 获取当前数据库中的用户
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    const studentUser = users.find(u => u.role === 'student');
    const teacherUser = users.find(u => u.role === 'teacher');
    
    if (!studentUser || !teacherUser) {
      console.log('❌ 需要至少一个学生和一个教师用户');
      process.exit(1);
    }
    
    console.log(`学生用户: ${studentUser.username} (${studentUser.name})`);
    console.log(`教师用户: ${teacherUser.username} (${teacherUser.name})\n`);
    
    // 获取学生和教师的详细信息
    const students = await mongoose.connection.db.collection('students').find({}).toArray();
    const teachers = await mongoose.connection.db.collection('teachers').find({}).toArray();
    
    const studentDoc = students.find(s => s.user && s.user.toString() === studentUser._id.toString());
    const teacherDoc = teachers.find(t => t.user && t.user.toString() === teacherUser._id.toString());
    
    if (!studentDoc) {
      console.log('❌ 学生文档未找到');
      process.exit(1);
    }
    if (!teacherDoc) {
      console.log('❌ 教师文档未找到');
      process.exit(1);
    }
    
    console.log(`学生ID: ${studentDoc._id}`);
    console.log(`教师ID: ${teacherDoc._id}\n`);
    
    // 1. 创建匹配记录
    console.log('1️⃣ 创建匹配记录...');
    const matchResult = await mongoose.connection.db.collection('matches').insertOne({
      studentId: studentDoc._id,
      teacherId: teacherDoc._id,
      status: 'active',
      match_date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`✅ 匹配记录已创建: ${matchResult.insertedId}\n`);
    
    // 2. 创建真实的聊天消息
    console.log('2️⃣ 创建聊天消息...');
    const messages = [
      {
        senderId: studentUser._id,
        receiverId: teacherUser._id,
        content: '老师好！我是新来的学生，请多多关照。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        senderId: teacherUser._id,
        receiverId: studentUser._id,
        content: '你好！欢迎来到乡村助学平台。很高兴能成为你的老师。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        senderId: studentUser._id,
        receiverId: teacherUser._id,
        content: '谢谢老师！我最近在学习数学，有些地方不太明白。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        senderId: teacherUser._id,
        receiverId: studentUser._id,
        content: '没关系，学习遇到困难是很正常的。你具体是哪个部分不太明白？',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        senderId: studentUser._id,
        receiverId: teacherUser._id,
        content: '主要是应用题，我总是不太会分析题目。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        senderId: teacherUser._id,
        receiverId: studentUser._id,
        content: '应用题确实需要多练习。我建议你先把题目多读几遍，找出关键信息，然后一步一步来分析。我会给你找一些例题练习的。',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        senderId: studentUser._id,
        receiverId: teacherUser._id,
        content: '好的，谢谢老师！我会努力学习的！',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        senderId: teacherUser._id,
        receiverId: studentUser._id,
        content: '加油！有什么不懂的随时问我。',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    const messageResult = await mongoose.connection.db.collection('messages').insertMany(messages);
    console.log(`✅ 已创建 ${messageResult.insertedCount} 条消息\n`);
    
    console.log('=== 测试数据添加完成 ===');
    console.log('\n现在你可以：');
    console.log(`1. 用学生账号 (${studentUser.username}) 登录学生端，应该能看到聊天记录`);
    console.log(`2. 用教师账号 (${teacherUser.username}) 登录教师端，应该能看到该学生`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加测试数据失败:', error);
    process.exit(1);
  }
}).catch(e => {
  console.error('数据库连接失败:', e);
  process.exit(1);
});
