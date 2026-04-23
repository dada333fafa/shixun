const mongoose = require('mongoose');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const TeacherStudentMatch = require('./models/TeacherStudentMatch');
const Message = require('./models/Message');

async function deleteUser99() {
  try {
    await mongoose.connect('mongodb://localhost:27017/xiangcun');
    console.log('✅ 数据库连接成功\n');

    // 1. 查找用户名为99的用户
    const users = await User.find({ name: '99' });
    console.log('📊 找到用户:', users.map(u => ({ id: u._id, name: u.name, role: u.role })));
    
    if (users.length === 0) {
      console.log('❌ 未找到用户名为99的用户');
      process.exit(0);
    }

    const userIds = users.map(u => u._id);

    // 2. 查找对应的教师记录
    const teachers = await Teacher.find({ user: { $in: userIds } });
    console.log('\n📊 找到教师记录:', teachers.map(t => ({ teacherId: t._id, userId: t.user })));
    
    if (teachers.length === 0) {
      console.log('❌ 未找到对应的教师记录');
      process.exit(0);
    }

    const teacherIds = teachers.map(t => t._id);

    // 3. 删除相关的匹配记录
    const matchResult = await TeacherStudentMatch.deleteMany({ teacher: { $in: teacherIds } });
    console.log(`\n🗑️  删除匹配记录: ${matchResult.deletedCount} 条`);

    // 4. 删除相关的消息记录（发送者或接收者是该用户）
    const messageResult = await Message.deleteMany({
      $or: [
        { senderId: { $in: userIds } },
        { receiverId: { $in: userIds } }
      ]
    });
    console.log(`🗑️  删除消息记录: ${messageResult.deletedCount} 条`);

    // 5. 删除教师记录
    const teacherResult = await Teacher.deleteMany({ _id: { $in: teacherIds } });
    console.log(`🗑️  删除教师记录: ${teacherResult.deletedCount} 条`);

    // 6. 删除用户记录
    const userResult = await User.deleteMany({ _id: { $in: userIds } });
    console.log(`🗑️  删除用户记录: ${userResult.deletedCount} 条`);

    console.log('\n✅ 清理完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

deleteUser99();
