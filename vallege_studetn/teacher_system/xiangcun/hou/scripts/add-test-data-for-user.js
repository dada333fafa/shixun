require('dotenv').config();
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Message = require('../models/Message');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB 连接成功');
    
    try {
      // 1. 查找"文文文"用户
      const currentUser = await User.findById('69e607a028f07f1250d4f843');
      if (!currentUser) {
        console.error('❌ 未找到用户 ID: 69e607a028f07f1250d4f843');
        process.exit(1);
      }
      console.log(`✅ 找到当前用户: ${currentUser.name} (ID: ${currentUser._id})`);

      // 2. 查找或创建测试学生
      let student = await User.findOne({ username: 'test_student' });
      if (!student) {
        student = await User.create({
          username: 'test_student',
          password: '123456',
          name: '测试学生',
          role: 'student',
          grade: '三年级',
          status: 'approved'
        });
        console.log('✅ 创建测试学生账号: test_student / 123456');
      } else {
        console.log('ℹ️  测试学生账号已存在');
      }

      // 3. 为当前用户添加测试资源
      const testResources = [
        {
          teacherId: currentUser._id,
          title: '三年级语文上册第一单元课件',
          description: '包含课文《大青树下的小学》《花的学校》等课文的教学课件，适合乡村小学教学使用',
          resourceType: 'courseware',
          fileName: 'unit1_chinese.pptx',
          filePath: '/uploads/resources/unit1_chinese.pptx',
          fileSize: 2048000,
          uploadDate: new Date(),
          downloadCount: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          teacherId: currentUser._id,
          title: '数学口算练习题（100以内加减法）',
          description: '适合三年级学生的口算练习，包含加减法混合运算，共50道题',
          resourceType: 'exercise',
          fileName: 'math_exercise_100.pdf',
          filePath: '/uploads/resources/math_exercise_100.pdf',
          fileSize: 512000,
          uploadDate: new Date(),
          downloadCount: 32,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          teacherId: currentUser._id,
          title: '《望庐山瀑布》教学设计',
          description: '古诗教学详细教案，包含教学目标、重难点、教学过程、板书设计等完整内容',
          resourceType: 'lesson_plan',
          fileName: 'poetry_lesson_plan.docx',
          filePath: '/uploads/resources/poetry_lesson_plan.docx',
          fileSize: 256000,
          uploadDate: new Date(),
          downloadCount: 28,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          teacherId: currentUser._id,
          title: '小学数学趣味教学视频合集',
          description: '包含10个趣味数学教学视频，涵盖图形认识、分数初步等内容，每集5-8分钟',
          resourceType: 'video',
          fileName: 'math_videos.mp4',
          filePath: '/uploads/resources/math_videos.mp4',
          fileSize: 52428800,
          uploadDate: new Date(),
          downloadCount: 45,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          teacherId: currentUser._id,
          title: '英语单词卡片（三年级上册）',
          description: 'Unit 1-4 重点单词卡片，包含单词、音标、中文释义和例句',
          resourceType: 'courseware',
          fileName: 'english_flashcards.pdf',
          filePath: '/uploads/resources/english_flashcards.pdf',
          fileSize: 1024000,
          uploadDate: new Date(),
          downloadCount: 20,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const resources = await Resource.insertMany(testResources);
      console.log(`✅ 成功添加 ${resources.length} 个测试资源`);

      // 4. 添加测试消息
      const testMessages = [
        {
          senderId: currentUser._id,
          receiverId: student._id,
          content: '你好！最近学习怎么样？作业都完成了吗？',
          type: 'text',
          status: 'read',
          createdAt: new Date(Date.now() - 3600000),
          updatedAt: new Date(Date.now() - 3600000)
        },
        {
          senderId: student._id,
          receiverId: currentUser._id,
          content: '老师好！我最近学习很好，作业都完成了。谢谢老师关心！',
          type: 'text',
          status: 'read',
          createdAt: new Date(Date.now() - 1800000),
          updatedAt: new Date(Date.now() - 1800000)
        },
        {
          senderId: currentUser._id,
          receiverId: student._id,
          content: '太好了！继续保持。如果有什么问题随时问我哦 😊',
          type: 'text',
          status: 'sent',
          createdAt: new Date(Date.now() - 900000),
          updatedAt: new Date(Date.now() - 900000)
        }
      ];

      const messages = await Message.insertMany(testMessages);
      console.log(`✅ 成功添加 ${messages.length} 条测试消息`);

      console.log('\n🎉 测试数据初始化完成！');
      console.log('\n📝 测试账号信息：');
      console.log(`   当前用户: ${currentUser.name} (已添加数据)`);
      console.log('   学生账号: test_student / 123456');
      console.log('\n📊 数据统计：');
      console.log(`   - 资源数量: ${resources.length} 个`);
      console.log(`   - 消息数量: ${messages.length} 条`);
      console.log('\n✅ 现在刷新页面即可看到数据！');

    } catch (error) {
      console.error('❌ 初始化失败:', error);
    } finally {
      // 关闭数据库连接
      await mongoose.connection.close();
      console.log('\n✅ 数据库连接已关闭');
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB 连接失败:', err);
    process.exit(1);
  });
