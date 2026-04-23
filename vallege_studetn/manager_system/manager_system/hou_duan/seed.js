const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 导入模型
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const TeachingResource = require('./models/TeachingResource');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

async function seedData() {
  try {
    console.log('开始初始化数据...');

    // 清空现有数据
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await TeachingResource.deleteMany({});
    console.log('已清空现有数据');

    // 创建管理员
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      name: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      isActive: true
    });
    console.log('✓ 创建管理员账号: admin / admin123');

    // 创建教师用户
    const teacher1Password = await bcrypt.hash('teacher123', 10);
    const teacher1 = await User.create({
      username: 'teacher1',
      password: teacher1Password,
      role: 'teacher',
      name: '王老师',
      email: 'teacher1@example.com',
      phone: '13900139001',
      isActive: true
    });

    const teacher2Password = await bcrypt.hash('teacher123', 10);
    const teacher2 = await User.create({
      username: 'teacher2',
      password: teacher2Password,
      role: 'teacher',
      name: '李老师',
      email: 'teacher2@example.com',
      phone: '13900139002',
      isActive: true
    });
    console.log('✓ 创建2个教师账号');

    // 创建教师详细信息
    const teacher1Detail = await Teacher.create({
      userId: teacher1._id,
      subject: '数学',
      education: '本科',
      experience: '5年教学经验',
      introduction: '擅长小学数学教学,注重基础培养',
      rating: 4.5
    });

    const teacher2Detail = await Teacher.create({
      userId: teacher2._id,
      subject: '语文',
      education: '硕士',
      experience: '8年教学经验',
      introduction: '专注于阅读和写作能力提升',
      rating: 4.8
    });
    console.log('✓ 创建教师详细信息');

    // 创建家长用户
    const parent1Password = await bcrypt.hash('parent123', 10);
    const parent1 = await User.create({
      username: 'parent1',
      password: parent1Password,
      role: 'parent',
      name: '张三爸爸',
      email: 'parent1@example.com',
      phone: '13700137001',
      isActive: true
    });

    const parent2Password = await bcrypt.hash('parent123', 10);
    const parent2 = await User.create({
      username: 'parent2',
      password: parent2Password,
      role: 'parent',
      name: '李四妈妈',
      email: 'parent2@example.com',
      phone: '13700137002',
      isActive: true
    });
    console.log('✓ 创建2个家长账号');

    // 创建学生用户
    const student1Password = await bcrypt.hash('student123', 10);
    const student1 = await User.create({
      username: 'student1',
      password: student1Password,
      role: 'student',
      name: '张三',
      email: 'student1@example.com',
      phone: '13600136001',
      isActive: true
    });

    const student2Password = await bcrypt.hash('student123', 10);
    const student2 = await User.create({
      username: 'student2',
      password: student2Password,
      role: 'student',
      name: '李四',
      email: 'student2@example.com',
      phone: '13600136002',
      isActive: true
    });
    console.log('✓ 创建2个学生账号');

    // 创建学生详细信息
    await Student.create({
      userId: student1._id,
      grade: '三年级',
      school: '希望小学',
      address: '乡村1组',
      parentId: parent1._id
    });

    await Student.create({
      userId: student2._id,
      grade: '五年级',
      school: '光明小学',
      address: '乡村2组',
      parentId: parent2._id
    });
    console.log('✓ 创建学生详细信息');

    // 创建教学资源
    await TeachingResource.create({
      teacherId: teacher1Detail._id,
      title: '三年级数学上册课件',
      description: '包含第一单元知识点',
      resourceType: 'courseware',
      filePath: '/resources/courseware/math3_1.pptx',
      downloadCount: 25
    });

    await TeachingResource.create({
      teacherId: teacher2Detail._id,
      title: '五年级语文阅读技巧',
      description: '提高阅读理解能力',
      resourceType: 'lesson_plan',
      filePath: '/resources/lesson_plan/chinese5_reading.pdf',
      downloadCount: 18
    });

    await TeachingResource.create({
      teacherId: teacher1Detail._id,
      title: '四年级数学练习题',
      description: '综合练习题集',
      resourceType: 'exercise',
      filePath: '/resources/exercise/math4_exercises.pdf',
      downloadCount: 32
    });
    console.log('✓ 创建3个教学资源');

    console.log('\n✅ 数据初始化完成!');
    console.log('\n测试账号信息:');
    console.log('管理员: admin / admin123');
    console.log('教师1: teacher1 / teacher123');
    console.log('教师2: teacher2 / teacher123');
    console.log('家长1: parent1 / parent123');
    console.log('家长2: parent2 / parent123');
    console.log('学生1: student1 / student123');
    console.log('学生2: student2 / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
    process.exit(1);
  }
}

seedData();
