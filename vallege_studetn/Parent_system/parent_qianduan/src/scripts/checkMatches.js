import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;

// 连接MongoDB数据库
const MONGODB_URI = 'mongodb://localhost:27017/rural_education_platform';

mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 数据模型定义

// 用户模型
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'parent', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  avatar: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// 教师信息模型
const TeacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  education: String,
  experience: String,
  introduction: String,
  rating: {
    type: Number,
    default: 0
  }
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

// 学生信息模型
const StudentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  school: String,
  address: String,
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Student = mongoose.model('Student', StudentSchema);

// 师生匹配模型
const TeacherStudentMatchSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },
  request_from: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  request_message: String,
  parent_approval: {
    type: Boolean,
    default: false
  },
  matched_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const TeacherStudentMatch = mongoose.model('TeacherStudentMatch', TeacherStudentMatchSchema);

// 检查匹配记录
async function checkMatches() {
  try {
    // 获取所有匹配记录
    const matches = await TeacherStudentMatch.find()
    .populate('teacher_id')
    .populate('student_id')
    .populate('teacher_id.user_id')
    .populate('student_id.user_id');
    
    console.log('匹配记录数量:', matches.length);
    
    if (matches.length > 0) {
      console.log('匹配记录详情:');
      matches.forEach((match, index) => {
        console.log(`\n匹配 ${index + 1}:`);
        console.log(`ID: ${match._id}`);
        console.log(`教师: ${match.teacher_id?.user_id?.name || '未知'}`);
        console.log(`学生: ${match.student_id?.user_id?.name || '未知'}`);
        console.log(`状态: ${match.status}`);
        console.log(`家长审批: ${match.parent_approval}`);
        console.log(`学生家长ID: ${match.student_id?.parent_id || '未知'}`);
      });
    } else {
      console.log('没有找到匹配记录');
    }
    
    // 检查学生记录
    const students = await Student.find().populate('user_id');
    console.log('\n学生记录数量:', students.length);
    students.forEach((student, index) => {
      console.log(`\n学生 ${index + 1}:`);
      console.log(`ID: ${student._id}`);
      console.log(`姓名: ${student.user_id?.name || '未知'}`);
      console.log(`家长ID: ${student.parent_id || '未知'}`);
    });
    
  } catch (error) {
    console.error('检查匹配记录失败:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 运行检查
checkMatches();
