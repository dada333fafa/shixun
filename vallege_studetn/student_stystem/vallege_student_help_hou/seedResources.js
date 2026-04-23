const mongoose = require('mongoose');
const connectDB = require('./config/db');
const TeachingResource = require('./models/TeachingResource');
const Teacher = require('./models/Teacher');
const User = require('./models/User');

// 连接数据库
connectDB();

async function seedResources() {
  try {
    console.log('\n========== 开始创建示例学习资源 ==========');
    
    // 查找教师用户
    const teacher1User = await User.findOne({ username: 'teacher1' });
    const teacher2User = await User.findOne({ username: 'teacher2' });
    
    if (!teacher1User || !teacher2User) {
      console.log('未找到教师用户，请先运行 seedData.js');
      process.exit(1);
    }
    
    // 查找教师记录
    const teacher1 = await Teacher.findOne({ user: teacher1User._id });
    const teacher2 = await Teacher.findOne({ user: teacher2User._id });
    
    if (!teacher1 || !teacher2) {
      console.log('未找到教师记录，请先运行 seedData.js');
      process.exit(1);
    }
    
    console.log('找到教师:', teacher1User.name, '和', teacher2User.name);
    
    // 清空现有资源
    await TeachingResource.deleteMany({});
    console.log('已清空现有资源');
    
    // 创建示例资源
    const resources = [
      {
        teacher: teacher1._id,
        title: '分数加减法练习',
        description: '包含分数加减法的详细讲解和练习题，适合小学三年级学生使用。内容包括同分母分数加减、异分母分数加减等知识点。',
        resourceType: 'exercise',
        filePath: '/resources/math_fractions.pdf',
        fileName: '分数加减法练习.pdf'
      },
      {
        teacher: teacher1._id,
        title: '数学应用题解题思路',
        description: '详细讲解初中数学应用题的解题思路和方法，包括审题技巧、建模方法、解题步骤等，帮助学生提高解题能力。',
        resourceType: 'courseware',
        filePath: '/resources/math_applications.pptx',
        fileName: '数学应用题解题思路.pptx'
      },
      {
        teacher: teacher2._id,
        title: '作文写作技巧',
        description: '详细讲解初中作文的写作技巧和方法，包括审题、立意、结构安排、语言表达等方面，配有范文赏析。',
        resourceType: 'video',
        filePath: '/resources/chinese_writing.mp4',
        fileName: '作文写作技巧.mp4'
      },
      {
        teacher: teacher2._id,
        title: '古诗词鉴赏指南',
        description: '系统介绍古诗词的鉴赏方法，包括意象分析、情感把握、艺术手法等内容，适合初中生学习使用。',
        resourceType: 'lesson_plan',
        filePath: '/resources/chinese_poetry.pdf',
        fileName: '古诗词鉴赏指南.pdf'
      },
      {
        teacher: teacher1._id,
        title: '几何图形基础知识',
        description: '介绍平面几何的基本概念，包括点、线、面、角等基础知识，配有大量图示和例题。',
        resourceType: 'courseware',
        filePath: '/resources/math_geometry.pptx',
        fileName: '几何图形基础知识.pptx'
      },
      {
        teacher: teacher2._id,
        title: '阅读理解训练',
        description: '提供多篇精选阅读文章和配套练习题，帮助学生提高阅读理解能力和答题技巧。',
        resourceType: 'exercise',
        filePath: '/resources/chinese_reading.pdf',
        fileName: '阅读理解训练.pdf'
      }
    ];
    
    // 保存资源
    const savedResources = [];
    for (const resourceData of resources) {
      const resource = new TeachingResource(resourceData);
      await resource.save();
      savedResources.push(resource);
      console.log(`✓ 创建资源: ${resource.title}`);
    }
    
    console.log(`\n========== 成功创建 ${savedResources.length} 个学习资源 ==========`);
    process.exit(0);
  } catch (error) {
    console.error('创建资源失败:', error);
    process.exit(1);
  }
}

seedResources();
