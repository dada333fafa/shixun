const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 导入模型
const User = require('./models/User');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

async function seedTestData() {
  try {
    console.log('开始插入测试数据...');

    // 清空现有数据
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    console.log('✓ 已清空现有数据');

    // ==================== 创建教师用户 (10位) ====================
    const teachers = [
      { username: 'teacher_math_1', name: '张数学', subject: '数学', grade: '初一', education: '硕士', experience: '8年初中数学教学经验，擅长代数与几何', introduction: '注重逻辑思维培养，善于启发学生思考', rating: 4.8, email: 'zhang_math@example.com', phone: '13900001001' },
      { username: 'teacher_math_2', name: '李代数', subject: '数学', grade: '初二', education: '本科', experience: '6年初二数学教学，专攻函数与方程', introduction: '耐心细致，善于发现学生问题', rating: 4.5, email: 'li_algebra@example.com', phone: '13900001002' },
      { username: 'teacher_math_3', name: '王几何', subject: '数学', grade: '初三', education: '硕士', experience: '10年中考数学辅导经验，几何专家', introduction: '中考冲刺经验丰富，提分效果显著', rating: 4.9, email: 'wang_geometry@example.com', phone: '13900001003' },
      
      { username: 'teacher_eng_1', name: '陈英语', subject: '英语', grade: '初一', education: '本科', experience: '5年初中英语教学，口语流利', introduction: '注重听说读写全面发展', rating: 4.6, email: 'chen_english@example.com', phone: '13900001004' },
      { username: 'teacher_eng_2', name: '刘阅读', subject: '英语', grade: '初二', education: '硕士', experience: '7年英语阅读与写作教学', introduction: '擅长阅读理解技巧训练', rating: 4.7, email: 'liu_reading@example.com', phone: '13900001005' },
      
      { username: 'teacher_chi_1', name: '赵语文', subject: '语文', grade: '初一', education: '硕士', experience: '9年语文教学，文学功底深厚', introduction: '热爱传统文化，善于激发阅读兴趣', rating: 4.8, email: 'zhao_chinese@example.com', phone: '13900001006' },
      { username: 'teacher_chi_2', name: '孙作文', subject: '语文', grade: '初三', education: '本科', experience: '6年中考语文辅导，作文教学专家', introduction: '作文提分快，方法实用', rating: 4.6, email: 'sun_composition@example.com', phone: '13900001007' },
      
      { username: 'teacher_phy_1', name: '周物理', subject: '物理', grade: '初二', education: '硕士', experience: '8年物理教学，实验能力强', introduction: '理论与实践结合，让物理更有趣', rating: 4.7, email: 'zhou_physics@example.com', phone: '13900001008' },
      { username: 'teacher_psy_1', name: '吴心理', subject: '心理健康', grade: '全年级', education: '心理学硕士', experience: '10年青少年心理咨询经验，国家二级心理咨询师', introduction: '专注青少年心理健康，善于沟通引导', rating: 4.9, email: 'wu_psychology@example.com', phone: '13900001009' },
      { username: 'teacher_psy_2', name: '郑辅导', subject: '心理辅导', grade: '全年级', education: '教育学硕士', experience: '7年学生心理辅导，擅长压力管理', introduction: '温和耐心，帮助学生建立自信', rating: 4.8, email: 'zheng_counseling@example.com', phone: '13900001010' }
    ];

    // 创建教师用户和详细信息
    for (const t of teachers) {
      const password = await bcrypt.hash('teacher123', 10);
      const user = await User.create({
        username: t.username,
        password: password,
        role: 'teacher',
        name: t.name,
        email: t.email,
        phone: t.phone,
        isActive: true
      });

      await Teacher.create({
        userId: user._id,
        subject: t.subject,
        education: t.education,
        experience: t.experience,
        introduction: t.introduction,
        rating: t.rating
      });
      
      console.log(`✓ 创建教师: ${t.name} (${t.subject} - ${t.grade})`);
    }

    // ==================== 创建学生用户 (10位) ====================
    const students = [
      { username: 'student_001', name: '小明', grade: '初一', learningNeeds: '数学基础薄弱，代数和几何都需要加强；英语单词记忆困难', psychologicalState: '学习自信心不足，害怕回答错误，需要鼓励', parentName: '小明爸爸', parentPhone: '13800001001', email: 'student001@example.com', phone: '13700001001' },
      { username: 'student_002', name: '小红', grade: '初一', learningNeeds: '语文阅读理解能力弱，作文不会写；数学计算容易出错', psychologicalState: '性格开朗但学习压力大，容易焦虑', parentName: '小红妈妈', parentPhone: '13800001002', email: 'student002@example.com', phone: '13700001002' },
      { username: 'student_003', name: '小刚', grade: '初二', learningNeeds: '物理概念理解困难，数学函数部分薄弱；英语语法混乱', psychologicalState: '叛逆期，对学习有抵触情绪，需要引导', parentName: '小刚爸爸', parentPhone: '13800001003', email: 'student003@example.com', phone: '13700001003' },
      { username: 'student_004', name: '小丽', grade: '初二', learningNeeds: '英语听力和口语差，数学几何证明题不会做', psychologicalState: '内向害羞，不敢提问，需要建立自信', parentName: '小丽妈妈', parentPhone: '13800001004', email: 'student004@example.com', phone: '13700001004' },
      { username: 'student_005', name: '小强', grade: '初三', learningNeeds: '中考复习需要全面辅导，数学压轴题、英语阅读、语文作文都需要提升', psychologicalState: '中考压力大，失眠焦虑，需要心理疏导', parentName: '小强爸爸', parentPhone: '13800001005', email: 'student005@example.com', phone: '13700001005' },
      { username: 'student_006', name: '小芳', grade: '初三', learningNeeds: '物理电学部分不懂，化学方程式记不住，数学二次函数困难', psychologicalState: '学习动力不足，缺乏目标感，需要激励', parentName: '小芳妈妈', parentPhone: '13800001006', email: 'student006@example.com', phone: '13700001006' },
      { username: 'student_007', name: '小伟', grade: '初一', learningNeeds: '数学应用题不会分析，英语时态混淆，语文古诗词背诵困难', psychologicalState: '注意力不集中，容易分心，需要培养学习习惯', parentName: '小伟爸爸', parentPhone: '13800001007', email: 'student007@example.com', phone: '13700001007' },
      { username: 'student_008', name: '小美', grade: '初二', learningNeeds: '英语完形填空和阅读理解失分多，数学不等式组不会解', psychologicalState: '完美主义倾向，对自己要求过高，容易沮丧', parentName: '小美妈妈', parentPhone: '13800001008', email: 'student008@example.com', phone: '13700001008' },
      { username: 'student_009', name: '小军', grade: '初三', learningNeeds: '全科都需要补习，基础特别差，需要从 basics 开始', psychologicalState: '自卑感强，认为自己学不好，需要重建信心', parentName: '小军爸爸', parentPhone: '13800001009', email: 'student009@example.com', phone: '13700001009' },
      { username: 'student_010', name: '小燕', grade: '初一', learningNeeds: '数学有理数运算错误多，英语音标不会读，语文文言文看不懂', psychologicalState: '适应初中生活有困难，想家情绪重，需要关怀', parentName: '小燕妈妈', parentPhone: '13800001010', email: 'student010@example.com', phone: '13700001010' }
    ];

    // 创建学生用户和详细信息
    for (const s of students) {
      const password = await bcrypt.hash('student123', 10);
      const user = await User.create({
        username: s.username,
        password: password,
        role: 'student',
        name: s.name,
        email: s.email,
        phone: s.phone,
        isActive: true
      });

      await Student.create({
        userId: user._id,
        grade: s.grade,
        school: '乡村中学',
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        learningNeeds: s.learningNeeds,
        psychologicalState: s.psychologicalState
      });
      
      console.log(`✓ 创建学生: ${s.name} (${s.grade})`);
    }

    // ==================== 创建管理员 ====================
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      name: '系统管理员',
      email: 'admin@example.com',
      phone: '13800138000',
      isActive: true
    });
    console.log('✓ 创建管理员账号');

    console.log('\n✅ 测试数据插入完成!\n');
    console.log('==================== 测试账号信息 ====================');
    console.log('\n【管理员】');
    console.log('账号: admin / 密码: admin123');
    
    console.log('\n【教师账号】(密码都是: teacher123)');
    teachers.forEach((t, i) => {
      console.log(`${i + 1}. ${t.username} - ${t.name} (${t.subject} ${t.grade})`);
    });
    
    console.log('\n【学生账号】(密码都是: student123)');
    students.forEach((s, i) => {
      console.log(`${i + 1}. ${s.username} - ${s.name} (${s.grade})`);
    });
    
    console.log('\n====================================================\n');
    console.log('💡 AI匹配测试建议:');
    console.log('1. 使用管理员账号登录');
    console.log('2. 进入"AI配置"页面');
    console.log('3. 在底部"AI教师匹配测试"区域输入学生信息');
    console.log('4. 例如: 年级=初一, 学习需求=数学基础薄弱, 心理状态=自信心不足');
    console.log('5. 点击"开始AI匹配"查看结果\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 数据插入失败:', error);
    process.exit(1);
  }
}

seedTestData();
