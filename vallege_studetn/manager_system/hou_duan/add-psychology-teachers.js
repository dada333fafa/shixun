const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 导入模型
const User = require('./models/User');
const Teacher = require('./models/Teacher');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

async function addPsychologyTeachers() {
  try {
    console.log('开始添加10位心理老师...\n');

    // 10位不同专长的心理老师
    const psychologyTeachers = [
      { 
        username: 'teacher_psy_3', 
        name: '林焦虑', 
        subject: '心理健康', 
        specialty: '焦虑症治疗',
        education: '心理学博士', 
        experience: '12年焦虑障碍治疗经验，擅长认知行为疗法(CBT)，帮助超过500名学生克服考试焦虑和社交焦虑', 
        introduction: '专注于青少年焦虑问题，采用科学方法帮助学生建立应对机制', 
        rating: 4.9, 
        email: 'lin_anxiety@example.com', 
        phone: '13900001011' 
      },
      { 
        username: 'teacher_psy_4', 
        name: '黄抑郁', 
        subject: '心理健康', 
        specialty: '抑郁症干预',
        education: '临床心理学硕士', 
        experience: '10年青少年抑郁症干预经验，持有心理咨询师证书，擅长情绪调节训练', 
        introduction: '温和专业，帮助学生走出情绪低谷，重建生活信心', 
        rating: 4.8, 
        email: 'huang_depression@example.com', 
        phone: '13900001012' 
      },
      { 
        username: 'teacher_psy_5', 
        name: '何自信', 
        subject: '心理辅导', 
        specialty: '自信心建立',
        education: '教育学硕士', 
        experience: '8年学生自信心培养经验，设计"成长型思维"训练课程，效果显著', 
        introduction: '善于发现学生闪光点，通过正向激励帮助学生建立自信', 
        rating: 4.7, 
        email: 'he_confidence@example.com', 
        phone: '13900001013' 
      },
      { 
        username: 'teacher_psy_6', 
        name: '罗压力', 
        subject: '心理健康', 
        specialty: '压力管理',
        education: '应用心理学硕士', 
        experience: '9年中高考压力疏导经验，开发"减压工作坊"，帮助学生科学应对学业压力', 
        introduction: '教授实用的压力管理技巧，让学生学会与压力和平共处', 
        rating: 4.8, 
        email: 'luo_stress@example.com', 
        phone: '13900001014' 
      },
      { 
        username: 'teacher_psy_7', 
        name: '梁人际', 
        subject: '心理辅导', 
        specialty: '人际关系改善',
        education: '社会心理学硕士', 
        experience: '7年青少年人际关系辅导，擅长处理同伴冲突、师生矛盾、亲子沟通问题', 
        introduction: '帮助学生掌握社交技巧，建立健康的人际关系网络', 
        rating: 4.6, 
        email: 'liang_relationship@example.com', 
        phone: '13900001015' 
      },
      { 
        username: 'teacher_psy_8', 
        name: '宋学习', 
        subject: '学习心理', 
        specialty: '学习动机激发',
        education: '教育心理学博士', 
        experience: '11年学习心理辅导经验，研究学习动机理论，帮助厌学学生重新找到学习兴趣', 
        introduction: '从心理学角度解决学习动力问题，让学习变得有趣', 
        rating: 4.9, 
        email: 'song_motivation@example.com', 
        phone: '13900001016' 
      },
      { 
        username: 'teacher_psy_9', 
        name: '唐注意力', 
        subject: '心理健康', 
        specialty: '注意力缺陷干预',
        education: '发展心理学硕士', 
        experience: '6年ADHD儿童青少年干预经验，结合行为训练和认知训练提升专注力', 
        introduction: '专业针对注意力不集中问题，提供个性化训练方案', 
        rating: 4.7, 
        email: 'tang_attention@example.com', 
        phone: '13900001017' 
      },
      { 
        username: 'teacher_psy_10', 
        name: '韩家庭', 
        subject: '家庭心理', 
        specialty: '家庭关系调解',
        education: '家庭治疗硕士', 
        experience: '10年家庭心理咨询经验，擅长处理离异家庭、留守儿童的心理健康问题', 
        introduction: '关注家庭系统对学生心理的影响，促进家庭和谐', 
        rating: 4.8, 
        email: 'han_family@example.com', 
        phone: '13900001018' 
      },
      { 
        username: 'teacher_psy_11', 
        name: '冯创伤', 
        subject: '心理健康', 
        specialty: '心理创伤修复',
        education: '创伤心理学博士', 
        experience: '8年心理创伤治疗经验，持有EMDR治疗师认证，帮助经历重大变故的学生恢复', 
        introduction: '专业处理创伤后应激障碍(PTSD)，用温暖和专业陪伴学生走出阴影', 
        rating: 4.9, 
        email: 'feng_trauma@example.com', 
        phone: '13900001019' 
      },
      { 
        username: 'teacher_psy_12', 
        name: '邓生涯', 
        subject: '生涯规划', 
        specialty: '职业生涯规划',
        education: '生涯规划硕士', 
        experience: '7年青少年生涯规划指导，结合兴趣测评和能力评估，帮助学生明确发展方向', 
        introduction: '帮助学生认识自我，探索职业兴趣，规划未来发展路径', 
        rating: 4.7, 
        email: 'deng_career@example.com', 
        phone: '13900001020' 
      }
    ];

    let successCount = 0;
    let failCount = 0;

    // 创建心理老师用户和详细信息
    for (const t of psychologyTeachers) {
      try {
        // 检查用户名是否已存在
        const existingUser = await User.findOne({ username: t.username });
        if (existingUser) {
          console.log(`⚠️  跳过: ${t.name} (${t.username}) - 用户已存在`);
          failCount++;
          continue;
        }

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
        
        console.log(`✓ 创建心理老师: ${t.name} - 专长: ${t.specialty}`);
        successCount++;
      } catch (error) {
        console.error(`✗ 创建失败: ${t.name} - ${error.message}`);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`添加完成！`);
    console.log(`成功: ${successCount} 位`);
    console.log(`失败/跳过: ${failCount} 位`);
    console.log('='.repeat(60));

    // 显示当前所有心理老师
    const allPsychologyTeachers = await Teacher.find({ 
      $or: [
        { subject: '心理健康' },
        { subject: '心理辅导' },
        { subject: '学习心理' },
        { subject: '家庭心理' },
        { subject: '生涯规划' }
      ]
    }).populate('userId', 'username name');

    console.log(`\n当前心理老师总数: ${allPsychologyTeachers.length} 位\n`);
    
    allPsychologyTeachers.forEach((t, index) => {
      console.log(`${index + 1}. ${t.userId.name} - ${t.subject} - 评分: ${t.rating}`);
      console.log(`   简介: ${t.introduction.substring(0, 50)}...`);
      console.log('');
    });

    process.exit();
  } catch (error) {
    console.error('操作失败:', error);
    process.exit(1);
  }
}

addPsychologyTeachers();
