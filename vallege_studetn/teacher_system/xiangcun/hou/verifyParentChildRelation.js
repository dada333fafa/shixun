const mongoose = require('mongoose');

async function verifyParentChildRelation() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ MongoDB连接成功\n');

    const Student = require('./models/Student');
    const User = require('./models/User');
    const Parent = require('./models/Parent');

    // 获取所有有parent字段的学生
    const students = await Student.find({ parent: { $exists: true, $ne: null } })
      .populate('user', 'name')
      .populate('parent', 'name');

    console.log('📊 学生-家长关联关系:\n');
    
    students.forEach((s, i) => {
      console.log(`${i + 1}. 学生: ${s.user?.name || '未知'}`);
      console.log(`   学生ID: ${s._id}`);
      console.log(`   家长User: ${s.parent?.name || '未知'}`);
      console.log(`   家长UserID: ${s.parent?._id || '无'}`);
      console.log('');
    });

    // 特别检查"家长"这个用户
    const parentUser = await User.findOne({ name: '家长' });
    console.log('\n👨‍👩‍ 家长用户信息:');
    console.log(`  Name: ${parentUser.name}`);
    console.log(`  UserID: ${parentUser._id}`);

    // 查找这个家长关联的学生
    const parentStudents = await Student.find({ parent: parentUser._id }).populate('user', 'name');
    console.log(`\n  关联的学生数量: ${parentStudents.length}`);
    parentStudents.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.user?.name || '未知'}`);
    });

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB连接已关闭');
  }
}

verifyParentChildRelation();
