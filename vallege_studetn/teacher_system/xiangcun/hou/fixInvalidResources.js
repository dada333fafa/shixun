const mongoose = require('mongoose');
require('./models/Teacher');
require('./models/User');
require('./models/Resource');

mongoose.connect('mongodb://localhost:27017/rural_education_platform').then(async () => {
  const Teacher = require('./models/Teacher');
  const Resource = require('./models/Resource');
  
  // 获取所有教师ID
  const teachers = await Teacher.find();
  const validTeacherIds = teachers.map(t => t._id.toString());
  console.log('=== 数据库中的教师 ===');
  teachers.forEach(t => console.log(`  ${t._id.toString()} (user: ${t.user})`));
  
  // 获取所有资源
  const resources = await Resource.find();
  console.log(`\n=== 资源中的teacher字段 ===`);
  console.log(`总共 ${resources.length} 条资源`);
  
  let validCount = 0;
  let invalidCount = 0;
  const invalidResources = [];
  
  resources.forEach(r => {
    if (r.teacher) {
      const teacherId = r.teacher.toString();
      if (validTeacherIds.includes(teacherId)) {
        validCount++;
      } else {
        invalidCount++;
        invalidResources.push({ resourceId: r._id, teacherId: teacherId, title: r.title });
      }
    } else {
      invalidCount++;
      invalidResources.push({ resourceId: r._id, teacherId: 'null', title: r.title });
    }
  });
  
  console.log(`  有效的: ${validCount}`);
  console.log(`  无效的: ${invalidCount}`);
  
  if (invalidResources.length > 0) {
    console.log('\n=== 无效关联的资源 ===');
    invalidResources.slice(0, 5).forEach(r => {
      console.log(`  资源: ${r.resourceId} | teacher: ${r.teacherId} | 标题: ${r.title}`);
    });
    if (invalidResources.length > 5) {
      console.log(`  ...还有 ${invalidResources.length - 5} 条`);
    }
    
    // 删除无效关联的资源
    console.log('\n正在删除无效关联的资源...');
    const deleteResult = await Resource.deleteMany({ 
      _id: { $in: invalidResources.map(r => r.resourceId) } 
    });
    console.log(`已删除 ${deleteResult.deletedCount} 条无效资源`);
    
    // 验证
    const remainingResources = await Resource.countDocuments();
    console.log(`剩余资源: ${remainingResources} 条`);
  }
  
  // 验证populate
  console.log('\n=== 验证populate ===');
  const testResources = await Resource.find().limit(3).populate({
    path: 'teacher',
    populate: { path: 'user', select: 'name' }
  });
  testResources.forEach((r, i) => {
    console.log(`${i+1}. ${r.title} - teacher: ${r.teacher ? r.teacher._id : 'null'}`);
  });
  
  process.exit();
}).catch(e => {
  console.error('Error:', e.message);
  console.error(e.stack);
  process.exit(1);
});
