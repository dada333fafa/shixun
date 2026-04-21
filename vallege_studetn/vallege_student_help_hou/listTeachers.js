const connectDB = require('./config/db');
const User = require('./models/User');
const Teacher = require('./models/Teacher');

// 连接数据库
connectDB();

// 查询并显示所有教师信息
const displayTeachers = async () => {
  try {
    console.log('\n========== 所有教师用户列表 ==========\n');
    
    // 获取所有教师用户
    const teachers = await User.find({ role: 'teacher' });
    
    if (teachers.length === 0) {
      console.log('没有找到教师用户');
    } else {
      console.log(`找到 ${teachers.length} 个教师用户:\n`);
      
      for (const teacher of teachers) {
        // 获取教师的详细信息
        const teacherDetail = await Teacher.findOne({ user: teacher._id });
        
        console.log(`教师姓名: ${teacher.name}`);
        console.log(`用户名: ${teacher.username}`);
        console.log(`用户ID: ${teacher._id}`);
        console.log(`手机号: ${teacher.phone}`);
        console.log(`邮箱: ${teacher.email}`);
        
        if (teacherDetail) {
          console.log(`教学科目: ${teacherDetail.subject}`);
          console.log(`学历: ${teacherDetail.education}`);
          console.log(`教学经验: ${teacherDetail.experience}`);
          console.log(`简介: ${teacherDetail.introduction}`);
        }
        
        console.log('\n----------------------------------------\n');
      }
    }
    
    console.log('\n========== 使用说明 ==========\n');
    console.log('你可以在聊天功能中使用上述的 "用户ID" 作为 receiverId');
    console.log('例如，要与王老师聊天，receiverId 应该是: ' + teachers[0]._id);
    console.log('\n登录信息:');
    console.log('- 学生账号: student1 / student123');
    console.log('- 老师账号: teacher1 / teacher123, teacher2 / teacher123, 等等');
    console.log('\n=====================================\n');
    
    process.exit(0);
  } catch (err) {
    console.error('错误:', err.message);
    process.exit(1);
  }
};

displayTeachers();
