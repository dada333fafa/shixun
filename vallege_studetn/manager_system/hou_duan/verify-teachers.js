require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const teachers = await Teacher.find({});
    
    console.log('=== Teacher表数据检查 ===\n');
    console.log(`Teacher表记录总数: ${teachers.length}\n`);
    
    console.log('检查每个教师的字段是否有值:\n');
    
    teachers.forEach((t, i) => {
      console.log(`${i + 1}. userId: ${t.userId ? '✓ 有值' : '✗ 空'}`);
      console.log(`   subject: ${t.subject ? '✓ ' + t.subject : '✗ 空'}`);
      console.log(`   education: ${t.education ? '✓ ' + t.education : '✗ 空'}`);
      console.log(`   experience: ${t.experience ? '✓ ' + t.experience.substring(0, 30) + '...' : '✗ 空'}`);
      console.log(`   introduction: ${t.introduction ? '✓ ' + t.introduction.substring(0, 30) + '...' : '✗ 空'}`);
      console.log(`   rating: ${t.rating !== undefined && t.rating !== null ? '✓ ' + t.rating : '✗ 空'}`);
      console.log('');
    });
    
    // 统计有多少教师的所有字段都有值
    const completeCount = teachers.filter(t => 
      t.userId && t.subject && t.education && t.experience && t.introduction && t.rating !== undefined
    ).length;
    
    console.log(`\n总结:`);
    console.log(`- 总记录数: ${teachers.length}`);
    console.log(`- 完整记录的教師数: ${completeCount}`);
    console.log(`- 不完整记录的教師数: ${teachers.length - completeCount}`);
    
    process.exit();
  } catch (error) {
    console.error('查询失败:', error);
    process.exit(1);
  }
})();
