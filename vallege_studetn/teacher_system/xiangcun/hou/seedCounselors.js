const mongoose = require('mongoose');
const Counselor = require('./models/Counselor');

mongoose.connect('mongodb://localhost:27017/rural_education_platform').then(async () => {
  console.log('数据库连接成功');

  // 检查是否已有数据
  const existingCount = await Counselor.countDocuments();
  if (existingCount > 0) {
    console.log(`数据库中已有 ${existingCount} 条咨询师数据，跳过插入`);
    process.exit();
  }

  // 插入咨询师数据
  const counselors = [
    {
      name: '张医生',
      title: '资深心理咨询师',
      qualification: '国家二级心理咨询师',
      experience: '15年心理咨询经验',
      specialties: ['焦虑症', '抑郁症', '青少年心理'],
      contact: '400-123-4567',
      email: 'zhang.counselor@example.com',
      phone: '138****1234',
      bio: '擅长青少年心理健康咨询，有15年临床经验。'
    },
    {
      name: '李医生',
      title: '青少年心理专家',
      qualification: '心理学博士',
      experience: '10年青少年心理辅导经验',
      specialties: ['学习压力', '人际关系', '自信心建设'],
      contact: '400-123-4568',
      email: 'li.counselor@example.com',
      phone: '139****5678',
      bio: '专注于青少年学习压力疏导和人际关系改善。'
    },
    {
      name: '王医生',
      title: '心理健康教育师',
      qualification: '教育学硕士',
      experience: '8年学校心理辅导经验',
      specialties: ['情绪管理', '心理危机干预', '家庭教育'],
      contact: '400-123-4569',
      email: 'wang.counselor@example.com',
      phone: '137****9012',
      bio: '长期从事学校心理健康教育工作，擅长情绪管理和心理危机干预。'
    }
  ];

  await Counselor.insertMany(counselors);
  console.log('成功插入 3 条咨询师数据');

  // 验证
  const count = await Counselor.countDocuments();
  console.log(`当前数据库中共有 ${count} 条咨询师数据`);

  const all = await Counselor.find();
  all.forEach(c => console.log(`- ${c.name} (${c.title})`));

  process.exit();
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
