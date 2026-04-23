const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '.env') });

// 导入模型
const TeacherEvaluation = require('./models/TeacherEvaluation');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const User = require('./models/User');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xiangcun_zhuxue', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ 数据库连接成功');
  runTest();
})
.catch(err => {
  console.error('❌ 数据库连接失败:', err);
  process.exit(1);
});

async function runTest() {
  try {
    console.log('\n📋 开始测试教师评价功能...\n');

    // 1. 查找一个教师
    const teacher = await Teacher.findOne().populate('user');
    if (!teacher) {
      console.log('⚠️  未找到教师，请先创建教师数据');
      return;
    }
    console.log(`✓ 找到教师: ${teacher.user.name}`);

    // 2. 查找一个学生
    const student = await Student.findOne().populate('user');
    if (!student) {
      console.log('⚠️  未找到学生，请先创建学生数据');
      return;
    }
    console.log(`✓ 找到学生: ${student.user.name}`);

    // 3. 创建测试评价
    console.log('\n📝 创建测试评价...');
    const evaluation = await TeacherEvaluation.create({
      student: student._id,
      teacher: teacher._id,
      score: 85,
      comment: '该学生学习态度认真，作业完成质量较高。建议在数学方面多加练习，特别是几何部分。总体来说表现良好，希望继续保持。',
      subject: '综合',
      evaluationDate: new Date()
    });
    console.log('✓ 评价创建成功');
    console.log(`  - 分数: ${evaluation.score}`);
    console.log(`  - 科目: ${evaluation.subject}`);
    console.log(`  - 评语: ${evaluation.comment.substring(0, 50)}...`);

    // 4. 查询评价
    console.log('\n🔍 查询学生的所有评价...');
    const evaluations = await TeacherEvaluation.find({ student: student._id })
      .populate('teacher', 'name')
      .populate('student', 'name grade')
      .sort({ evaluationDate: -1 });
    
    console.log(`✓ 找到 ${evaluations.length} 条评价记录`);
    evaluations.forEach((eval_item, index) => {
      console.log(`\n评价 ${index + 1}:`);
      console.log(`  教师: ${eval_item.teacher?.name || '未知'}`);
      console.log(`  学生: ${eval_item.student?.name || '未知'}`);
      console.log(`  分数: ${eval_item.score}`);
      console.log(`  科目: ${eval_item.subject}`);
      console.log(`  评语: ${eval_item.comment}`);
      console.log(`  时间: ${eval_item.evaluationDate.toLocaleString('zh-CN')}`);
    });

    // 5. 测试更新评价
    console.log('\n✏️  测试更新评价...');
    evaluation.score = 90;
    evaluation.comment = '更新后的评语：学生进步明显，特别是在数学方面有显著提升。';
    await evaluation.save();
    console.log('✓ 评价更新成功');
    console.log(`  - 新分数: ${evaluation.score}`);
    console.log(`  - 新评语: ${evaluation.comment}`);

    console.log('\n✅ 所有测试通过！');
    console.log('\n💡 提示：');
    console.log('   - 教师可以在学生管理界面点击"评价"按钮给学生打分和写评语');
    console.log('   - 家长可以在学习报告页面查看教师的评价信息');
    console.log('   - 评价数据已存储到数据库中\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  }
}
