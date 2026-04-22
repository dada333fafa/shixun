const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/rural_education_platform').then(async () => {
  const db = mongoose.connection.db;
  
  // 检查需要修复的记录
  const count = await db.collection('resources').countDocuments({ 
    teacherId: { $exists: true }, 
    teacher: { $exists: false } 
  });
  console.log('需要修复的记录数:', count);
  
  if (count > 0) {
    // 使用聚合管道更新
    const result = await db.collection('resources').updateMany(
      { teacherId: { $exists: true }, teacher: { $exists: false } },
      [
        { $set: { teacher: '$teacherId' } },
        { $unset: ['teacherId'] }
      ]
    );
    console.log('修复结果:', result.modifiedCount, '条记录已修复');
  }
  
  // 验证修复结果
  const resources = await db.collection('resources').find().limit(3).toArray();
  console.log('\n修复后样本:');
  resources.forEach((r, i) => console.log(i+1, 'teacher:', r.teacher, 'title:', r.title));
  
  // 检查教师数据
  const teachers = await db.collection('teachers').find().limit(3).toArray();
  console.log('\n教师样本:');
  teachers.forEach((t, i) => console.log(i+1, '_id:', t._id, 'user:', t.user, 'subject:', t.subject));
  
  process.exit();
}).catch(e => {
  console.error(e.message);
  process.exit(1);
});
