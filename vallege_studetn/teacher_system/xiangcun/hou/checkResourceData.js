const mongoose = require('mongoose');
require('./models/Teacher');
require('./models/User');
require('./models/Resource');

mongoose.connect('mongodb://localhost:27017/rural_education_platform').then(async () => {
  const Resource = require('./models/Resource');
  
  const resources = await Resource.find().limit(3).populate({
    path: 'teacher',
    populate: {
      path: 'user',
      select: 'name'
    }
  });
  
  console.log('=== 资源数据测试 ===\n');
  resources.forEach((r, i) => {
    console.log(`${i+1}. 资源ID: ${r._id}`);
    console.log(`   标题: ${r.title}`);
    console.log(`   teacher对象:`, r.teacher);
    console.log(`   teacher._id:`, r.teacher?._id);
    console.log(`   teacher.user:`, r.teacher?.user);
    console.log(`   teacher.subject:`, r.teacher?.subject);
    console.log('');
  });
  
  process.exit();
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
