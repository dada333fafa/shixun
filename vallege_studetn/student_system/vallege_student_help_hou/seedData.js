const connectDB = require('./config/db');
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Parent = require('./models/Parent');
const bcrypt = require('bcryptjs');

// 连接数据库
connectDB();

// 示例数据
const sampleData = async () => {
  try {
    // 清空现有数据
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Parent.deleteMany({});

    // 创建管理员用户
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      name: '管理员',
      phone: '13800138000',
      email: 'admin@example.com'
    });

    const savedAdmin = await adminUser.save();
    console.log('管理员用户创建成功');

    // 创建教师用户
    const teacher1Password = await bcrypt.hash('teacher123', salt);
    const teacher1User = new User({
      username: 'teacher1',
      password: teacher1Password,
      role: 'teacher',
      name: '王老师',
      phone: '13900139001',
      email: 'teacher1@example.com'
    });

    const teacher2Password = await bcrypt.hash('teacher123', salt);
    const teacher2User = new User({
      username: 'teacher2',
      password: teacher2Password,
      role: 'teacher',
      name: '李老师',
      phone: '13900139002',
      email: 'teacher2@example.com'
    });

    const teacher3Password = await bcrypt.hash('teacher123', salt);
    const teacher3User = new User({
      username: 'teacher3',
      password: teacher3Password,
      role: 'teacher',
      name: '张老师',
      phone: '13900139003',
      email: 'teacher3@example.com'
    });

    const teacher4Password = await bcrypt.hash('teacher123', salt);
    const teacher4User = new User({
      username: 'teacher4',
      password: teacher4Password,
      role: 'teacher',
      name: '刘老师',
      phone: '13900139004',
      email: 'teacher4@example.com'
    });

    const teacher5Password = await bcrypt.hash('teacher123', salt);
    const teacher5User = new User({
      username: 'teacher5',
      password: teacher5Password,
      role: 'teacher',
      name: '陈老师',
      phone: '13900139005',
      email: 'teacher5@example.com'
    });

    const savedTeacher1 = await teacher1User.save();
    const savedTeacher2 = await teacher2User.save();
    const savedTeacher3 = await teacher3User.save();
    const savedTeacher4 = await teacher4User.save();
    const savedTeacher5 = await teacher5User.save();
    console.log('教师用户创建成功');

    // 创建家长用户
    const parent1Password = await bcrypt.hash('parent123', salt);
    const parent1User = new User({
      username: 'parent1',
      password: parent1Password,
      role: 'parent',
      name: '张三爸爸',
      phone: '13700137001',
      email: 'parent1@example.com'
    });

    const parent2Password = await bcrypt.hash('parent123', salt);
    const parent2User = new User({
      username: 'parent2',
      password: parent2Password,
      role: 'parent',
      name: '李四妈妈',
      phone: '13700137002',
      email: 'parent2@example.com'
    });

    const savedParent1 = await parent1User.save();
    const savedParent2 = await parent2User.save();
    console.log('家长用户创建成功');

    // 创建学生用户
    const student1Password = await bcrypt.hash('student123', salt);
    const student1User = new User({
      username: 'student1',
      password: student1Password,
      role: 'student',
      name: '张三',
      phone: '13600136001',
      email: 'student1@example.com'
    });

    const student2Password = await bcrypt.hash('student123', salt);
    const student2User = new User({
      username: 'student2',
      password: student2Password,
      role: 'student',
      name: '李四',
      phone: '13600136002',
      email: 'student2@example.com'
    });

    const savedStudent1 = await student1User.save();
    const savedStudent2 = await student2User.save();
    console.log('学生用户创建成功');

    // 创建教师详细信息
    const teacher1Detail = new Teacher({
      user: savedTeacher1._id,
      subject: '数学',
      education: '本科',
      experience: '5年教学经验',
      introduction: '擅长小学数学教学，注重基础培养'
    });

    const teacher2Detail = new Teacher({
      user: savedTeacher2._id,
      subject: '语文',
      education: '硕士',
      experience: '8年教学经验',
      introduction: '专注于阅读和写作能力提升'
    });

    const teacher3Detail = new Teacher({
      user: savedTeacher3._id,
      subject: '英语',
      education: '本科',
      experience: '6年教学经验',
      introduction: '擅长英语口语和听力教学，教学方法生动有趣'
    });

    const teacher4Detail = new Teacher({
      user: savedTeacher4._id,
      subject: '物理',
      education: '硕士',
      experience: '10年教学经验',
      introduction: '注重实验教学，培养学生科学思维'
    });

    const teacher5Detail = new Teacher({
      user: savedTeacher5._id,
      subject: '化学',
      education: '博士',
      experience: '12年教学经验',
      introduction: '善于将复杂概念简单化，激发学生兴趣'
    });

    await teacher1Detail.save();
    await teacher2Detail.save();
    await teacher3Detail.save();
    await teacher4Detail.save();
    await teacher5Detail.save();
    console.log('教师详细信息创建成功');

    // 创建家长详细信息
    const parent1Detail = new Parent({
      user: savedParent1._id,
      relation: '父亲'
    });

    const parent2Detail = new Parent({
      user: savedParent2._id,
      relation: '母亲'
    });

    await parent1Detail.save();
    await parent2Detail.save();
    console.log('家长详细信息创建成功');

    // 创建学生详细信息
    const student1Detail = new Student({
      user: savedStudent1._id,
      grade: '三年级',
      school: '希望小学',
      address: '乡村1组',
      parent: savedParent1._id
    });

    const student2Detail = new Student({
      user: savedStudent2._id,
      grade: '五年级',
      school: '光明小学',
      address: '乡村2组',
      parent: savedParent2._id
    });

    await student1Detail.save();
    await student2Detail.save();
    console.log('学生详细信息创建成功');

    console.log('所有示例数据创建成功！');
    process.exit(0);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

sampleData();