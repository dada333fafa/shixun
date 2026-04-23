const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const TeacherStudentMatch = require('./models/TeacherStudentMatch');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xiangcun_zhuxue')
.then(async () => {
  console.log('✅ 数据库连接成功\n');

  // 查找所有匹配关系（不populate，看原始数据）
  const matches = await TeacherStudentMatch.find().lean();

  console.log(`📊 找到 ${matches.length} 条匹配记录\n`);

  // 只显示 approved 或 active 状态的记录
  const activeMatches = matches.filter(m => m.status === 'approved' || m.status === 'active');
  
  console.log(`✅ 有效匹配关系（approved/active）: ${activeMatches.length} 条\n`);

  if (activeMatches.length > 0) {
    console.log('📋 详细匹配信息:');
    activeMatches.forEach((m, index) => {
      console.log(`\n匹配 ${index + 1}:`);
      console.log(`  ID: ${m._id}`);
      console.log(`  教师ID: ${m.teacher}`);
      console.log(`  学生ID: ${m.student}`);
      console.log(`  状态: ${m.status}`);
      console.log(`  创建时间: ${m.createdAt}`);
    });
  } else {
    console.log('⚠️  没有找到有效的师生匹配关系！');
    console.log('\n💡 请先在"匹配管理"页面建立教师对学生的辅导关系');
  }

  console.log('\n💡 调试步骤:');
  console.log('1. 复制上面的教师ID和学生ID');
  console.log('2. 确认"哈哈哈"教师的ID是: 69e97d0ffd05ae867312ecd2');
  console.log('3. 确认"刘子华"学生的ID是: 69e97d0ffd05ae867312ecd4');
  console.log('4. 查看上面是否有这两个人之间的匹配关系');

  process.exit(0);
})
.catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
