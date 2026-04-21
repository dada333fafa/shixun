const mongoose = require('mongoose');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/rural_education_platform');
    console.log('✅ 数据库连接成功\n');
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      name: String,
      role: String
    }, { timestamps: true }));
    
    const Teacher = mongoose.model('Teacher', new mongoose.Schema({
      user: { type: mongoose.Schema.Types.ObjectId },
      subject: String,
      education: String,
      experience: String,
      introduction: String
    }, { timestamps: true }));
    
    // 获取所有教师
    const teachers = await User.find({ role: 'teacher' });
    
    console.log('========== 教师数据详情 ==========\n');
    
    for (const teacher of teachers) {
      const teacherDetail = await Teacher.findOne({ user: teacher._id });
      
      console.log(`教师: ${teacher.name} (${teacher.username})`);
      console.log(`User ID: ${teacher._id}`);
      console.log(`Teacher Detail ID: ${teacherDetail ? teacherDetail._id : '无'}`);
      console.log(`科目: ${teacherDetail ? teacherDetail.subject : '无'}`);
      console.log(`科目类型: ${teacherDetail ? typeof teacherDetail.subject : '无'}`);
      console.log(`经验: ${teacherDetail ? teacherDetail.experience : '无'}`);
      console.log(`经验类型: ${teacherDetail ? typeof teacherDetail.experience : '无'}`);
      console.log('');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
  }
}

checkData();
