const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('=== 数据库真实数据查询 ===\n');
  
  // 查询用户
  console.log('1️⃣ 用户列表 (Users):');
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  if (users.length === 0) {
    console.log('   ❌ 无用户数据\n');
  } else {
    users.forEach((u, i) => {
      console.log(`   ${i + 1}. ID: ${u._id}`);
      console.log(`      用户名: ${u.username}`);
      console.log(`      姓名: ${u.name}`);
      console.log(`      角色: ${u.role}`);
      console.log(`      邮箱: ${u.email || '无'}`);
      console.log(`      电话: ${u.phone || '无'}`);
      console.log('');
    });
  }
  
  // 查询教师
  console.log('\n2️⃣ 教师列表 (Teachers):');
  const teachers = await mongoose.connection.db.collection('teachers').find({}).toArray();
  if (teachers.length === 0) {
    console.log('   ❌ 无教师数据\n');
  } else {
    teachers.forEach((t, i) => {
      console.log(`   ${i + 1}. ID: ${t._id}`);
      console.log(`      关联用户ID: ${t.user}`);
      console.log(`      科目: ${t.subject || '未设置'}`);
      console.log(`      学历: ${t.education || '未设置'}`);
      console.log('');
    });
  }
  
  // 查询学生
  console.log('\n3️⃣ 学生列表 (Students):');
  const students = await mongoose.connection.db.collection('students').find({}).toArray();
  if (students.length === 0) {
    console.log('   ❌ 无学生数据\n');
  } else {
    students.forEach((s, i) => {
      console.log(`   ${i + 1}. ID: ${s._id}`);
      console.log(`      关联用户ID: ${s.user}`);
      console.log(`      年级: ${s.grade || '未设置'}`);
      console.log('');
    });
  }
  
  // 查询消息
  console.log('\n4️⃣ 消息列表 (Messages):');
  const messages = await mongoose.connection.db.collection('messages').find({}).toArray();
  if (messages.length === 0) {
    console.log('   ❌ 无消息数据\n');
  } else {
    console.log(`   总消息数: ${messages.length}\n`);
    messages.slice(0, 10).forEach((m, i) => {
      console.log(`   ${i + 1}. 发送者: ${m.senderId}`);
      console.log(`      接收者: ${m.receiverId}`);
      console.log(`      内容: ${m.content}`);
      console.log(`      时间: ${m.createdAt}`);
      console.log('');
    });
  }
  
  // 查询匹配记录
  console.log('\n5️⃣ 匹配记录 (Matches):');
  const matches = await mongoose.connection.db.collection('matches').find({}).toArray();
  if (matches.length === 0) {
    console.log('   ❌ 无匹配数据\n');
  } else {
    matches.forEach((m, i) => {
      console.log(`   ${i + 1}. 学生ID: ${m.studentId}`);
      console.log(`      教师ID: ${m.teacherId}`);
      console.log(`      状态: ${m.status}`);
      console.log('');
    });
  }
  
  console.log('\n=== 数据查询完成 ===');
  process.exit(0);
}).catch(e => {
  console.error('查询失败:', e);
  process.exit(1);
});
