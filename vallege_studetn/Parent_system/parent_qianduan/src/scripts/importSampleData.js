import mongoose from 'mongoose';

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

// 家长信息模型
const ParentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relation: {
    type: String,
    required: true
  }
});

const Parent = mongoose.model('Parent', ParentSchema);

// 学习进度模型
const LearningProgressSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
});

const LearningProgress = mongoose.model('LearningProgress', LearningProgressSchema);

// 心理状态模型
const PsychologicalStatusSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assessment_date: {
    type: Date,
    required: true
  },
  emotional_state: {
    type: String,
    enum: ['excellent', 'good', 'normal', 'poor', 'critical'],
    default: 'normal'
  },
  anxiety_level: {
    type: Number,
    default: 0
  },
  depression_level: {
    type: Number,
    default: 0
  },
  counselor_notes: String,
  recommendation: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

const PsychologicalStatus = mongoose.model('PsychologicalStatus', PsychologicalStatusSchema);

// 教学资源模型
const TeachingResourceSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  resource_type: {
    type: String,
    enum: ['courseware', 'lesson_plan', 'exercise', 'video', 'other'],
    required: true
  },
  file_path: String,
  upload_date: {
    type: Date,
    default: Date.now
  }
});

const TeachingResource = mongoose.model('TeachingResource', TeachingResourceSchema);

// AI匹配推荐模型
const AIRecommendationSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  recommended_teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  match_score: {
    type: Number,
    required: true
  },
  reason: String,
  generated_at: {
    type: Date,
    default: Date.now
  }
});

const AIRecommendation = mongoose.model('AIRecommendation', AIRecommendationSchema);

// 导入示例数据
async function importSampleData() {
  try {
    // 清空现有数据
    await User.deleteMany({});
    await Teacher.deleteMany({});
    await Student.deleteMany({});
    await Parent.deleteMany({});
    await LearningProgress.deleteMany({});
    await PsychologicalStatus.deleteMany({});
    await TeachingResource.deleteMany({});
    await AIRecommendation.deleteMany({});
    console.log('已清空现有数据');

    // 插入用户数据
    const users = await User.insertMany([
      { username: 'admin', password: 'admin123', role: 'admin', name: '管理员', phone: '13800138000', email: 'admin@example.com' },
      { username: 'teacher1', password: 'teacher123', role: 'teacher', name: '王老师', phone: '13900139001', email: 'teacher1@example.com' },
      { username: 'teacher2', password: 'teacher123', role: 'teacher', name: '李老师', phone: '13900139002', email: 'teacher2@example.com' },
      { username: 'parent1', password: 'parent123', role: 'parent', name: '张三爸爸', phone: '13700137001', email: 'parent1@example.com' },
      { username: 'parent2', password: 'parent123', role: 'parent', name: '李四妈妈', phone: '13700137002', email: 'parent2@example.com' },
      { username: 'student1', password: 'student123', role: 'student', name: '张三', phone: '13600136001', email: 'student1@example.com' },
      { username: 'student2', password: 'student123', role: 'student', name: '李四', phone: '13600136002', email: 'student2@example.com' }
    ]);
    console.log('已插入用户数据');

    // 插入教师信息
    const teachers = await Teacher.insertMany([
      { user_id: users[1]._id, subject: '数学', education: '本科', experience: '5年教学经验', introduction: '擅长小学数学教学，注重基础培养' },
      { user_id: users[2]._id, subject: '语文', education: '硕士', experience: '8年教学经验', introduction: '专注于阅读和写作能力提升' }
    ]);
    console.log('已插入教师信息');

    // 插入家长信息
    await Parent.insertMany([
      { user_id: users[3]._id, relation: '父亲' },
      { user_id: users[4]._id, relation: '母亲' }
    ]);
    console.log('已插入家长信息');

    // 插入学生信息
    const students = await Student.insertMany([
      { user_id: users[5]._id, grade: '三年级', school: '希望小学', address: '乡村1组', parent_id: users[3]._id },
      { user_id: users[6]._id, grade: '五年级', school: '光明小学', address: '乡村2组', parent_id: users[4]._id }
    ]);
    console.log('已插入学生信息');

    // 插入学习进度
    await LearningProgress.insertMany([
      { student_id: students[0]._id, subject: '数学', progress: 65.5 },
      { student_id: students[0]._id, subject: '语文', progress: 72.0 },
      { student_id: students[1]._id, subject: '数学', progress: 58.0 },
      { student_id: students[1]._id, subject: '语文', progress: 80.5 }
    ]);
    console.log('已插入学习进度');

    // 插入心理状态
    await PsychologicalStatus.insertMany([
      { student_id: students[0]._id, assessment_date: new Date('2026-03-20'), emotional_state: 'good', anxiety_level: 1, depression_level: 0, counselor_notes: '状态良好，积极向上' },
      { student_id: students[1]._id, assessment_date: new Date('2026-03-22'), emotional_state: 'normal', anxiety_level: 2, depression_level: 1, counselor_notes: '偶尔有焦虑情绪，需要关注' }
    ]);
    console.log('已插入心理状态');

    // 插入教学资源
    await TeachingResource.insertMany([
      { teacher_id: teachers[0]._id, title: '三年级数学上册课件', description: '包含第一单元知识点', resource_type: 'courseware', file_path: '/resources/courseware/math3_1.pptx' },
      { teacher_id: teachers[1]._id, title: '五年级语文阅读技巧', description: '提高阅读理解能力', resource_type: 'lesson_plan', file_path: '/resources/lesson_plan/chinese5_reading.pdf' }
    ]);
    console.log('已插入教学资源');

    // 插入AI推荐
    await AIRecommendation.insertMany([
      { student_id: students[0]._id, recommended_teacher_id: teachers[0]._id, match_score: 92.5, reason: '学生数学成绩需要提升，教师擅长小学数学教学' },
      { student_id: students[1]._id, recommended_teacher_id: teachers[1]._id, match_score: 88.0, reason: '学生语文基础较好，教师专注于阅读和写作能力提升' }
    ]);
    console.log('已插入AI推荐');

    console.log('所有示例数据导入成功！');
  } catch (error) {
    console.error('导入数据失败:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 执行导入
importSampleData();
