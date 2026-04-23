// 诊断脚本：检查学生-家长关联关系
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');

async function checkParentChildRelation() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ 数据库连接成功');

    // 获取所有学生
    const students = await Student.find()
      .populate('user', 'name email')
      .populate('parent', 'name email')
      .lean();

    console.log('\n========== 学生-家长关联关系 ==========\n');
    console.log(`找到 ${students.length} 个学生\n`);

    students.forEach((student, index) => {
      console.log(`${index + 1}. 学生信息:`);
      console.log(`   学生ID: ${student._id}`);
      console.log(`   学生User ID: ${student.user?._id}`);
      console.log(`   学生姓名: ${student.user?.name || '未设置'}`);
      console.log(`   Parent字段: ${student.parent ? '已设置' : '未设置'}`);
      
      if (student.parent) {
        console.log(`   家长User ID: ${student.parent}`);
      } else {
        console.log(`   ⚠️  警告：该学生没有关联家长！`);
      }
      
      console.log('');
    });

    // 查找特定的学生（温）
    const targetStudent = await Student.findOne({})
      .populate('user', 'name')
      .populate('parent', 'name');
    
    console.log('========== 特定学生示例 ==========\n');
    if (targetStudent) {
      console.log('学生姓名:', targetStudent.user?.name);
      console.log('学生ID:', targetStudent._id);
      console.log('学生User ID:', targetStudent.user?._id);
      console.log('家长User ID:', targetStudent.parent);
    }

    console.log('\n========== 完成 ==========\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ 错误:', err);
    process.exit(1);
  }
}

checkParentChildRelation();
