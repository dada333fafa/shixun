const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');
const TeacherStudentMatch = require('./models/TeacherStudentMatch');
const Message = require('./models/Message');
const Resource = require('./models/Resource');
const User = require('./models/User');

async function cleanInvalidData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功\n');

    // 获取所有有效的用户ID
    const validUsers = await User.find().distinct('_id');
    console.log(`📊 有效用户数量: ${validUsers.length}`);

    // 获取所有有效的教师ID
    const validTeachers = await Teacher.find().distinct('_id');
    console.log(`📊 有效教师数量: ${validTeachers.length}\n`);

    // 1. 删除引用不存在用户的Teacher记录
    const invalidTeachers = await Teacher.find({ user: { $nin: validUsers } });
    if (invalidTeachers.length > 0) {
      console.log(`🔍 找到 ${invalidTeachers.length} 个引用无效用户的Teacher记录`);
      const result = await Teacher.deleteMany({ user: { $nin: validUsers } });
      console.log(`🗑️  已删除无效Teacher记录: ${result.deletedCount} 条\n`);
    } else {
      console.log('✅ 没有无效的Teacher记录\n');
    }

    // 重新获取有效的教师ID（可能刚刚删除了一些）
    const currentValidTeachers = await Teacher.find().distinct('_id');

    // 2. 删除引用不存在教师的匹配记录
    const invalidMatches = await TeacherStudentMatch.find({ teacher: { $nin: currentValidTeachers } });
    if (invalidMatches.length > 0) {
      console.log(`🔍 找到 ${invalidMatches.length} 个引用无效教师的匹配记录`);
      const result = await TeacherStudentMatch.deleteMany({ teacher: { $nin: currentValidTeachers } });
      console.log(`🗑️  已删除无效匹配记录: ${result.deletedCount} 条\n`);
    } else {
      console.log('✅ 没有无效的匹配记录\n');
    }

    // 3. 删除引用不存在用户的消息记录
    const currentValidUsers = await User.find().distinct('_id');
    const invalidMessages = await Message.find({
      $or: [
        { senderId: { $nin: currentValidUsers } },
        { receiverId: { $nin: currentValidUsers } }
      ]
    });
    if (invalidMessages.length > 0) {
      console.log(`🔍 找到 ${invalidMessages.length} 个引用无效用户的消息记录`);
      const result = await Message.deleteMany({
        $or: [
          { senderId: { $nin: currentValidUsers } },
          { receiverId: { $nin: currentValidUsers } }
        ]
      });
      console.log(`🗑️  已删除无效消息记录: ${result.deletedCount} 条\n`);
    } else {
      console.log('✅ 没有无效的消息记录\n');
    }

    // 4. 删除引用不存在教师的教学资源
    const invalidResources = await Resource.find({ teacher: { $nin: currentValidTeachers } });
    if (invalidResources.length > 0) {
      console.log(`🔍 找到 ${invalidResources.length} 个引用无效教师的资源记录`);
      const result = await Resource.deleteMany({ teacher: { $nin: currentValidTeachers } });
      console.log(`🗑️  已删除无效资源记录: ${result.deletedCount} 条\n`);
    } else {
      console.log('✅ 没有无效的资源记录\n');
    }

    console.log('✅ 数据清理完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

cleanInvalidData();
