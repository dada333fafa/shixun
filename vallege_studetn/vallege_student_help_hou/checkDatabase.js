const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    // 连接到你的MongoDB数据库
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功');
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      name: String,
      phone: String,
      email: String
    }, { timestamps: true }));
    
    // 获取所有教师
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    
    console.log('\n========== 数据库中的教师信息 ==========');
    console.log(`找到 ${teachers.length} 个教师:\n`);
    
    teachers.forEach((teacher, index) => {
      console.log(`教师 ${index + 1}:`);
      console.log(`  - ID (ObjectId): ${teacher._id}`);
      console.log(`  - ID 类型: ${typeof teacher._id}`);
      console.log(`  - 用户名: ${teacher.username}`);
      console.log(`  - 姓名: ${teacher.name}`);
      console.log(`  - 角色: ${teacher.role}`);
      console.log('');
    });
    
    console.log('\n✅ 数据检查完成');
    console.log('\n提示: 如果ID格式类似 "69d471501fea1953403e99d9"，说明是正确的ObjectId');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

checkDatabase();
